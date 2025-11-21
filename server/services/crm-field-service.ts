import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { customFieldDefinitions, type CustomFieldDefinition } from "@shared/schema";

export const CRM_OBJECT_TYPES = [
  "company",
  "contact",
  "deal",
  "email",
  "phone_call",
  "meeting",
  "task",
] as const;

export type CrmObjectType = (typeof CRM_OBJECT_TYPES)[number];

const FIELD_TYPE_ENUM = [
  "text",
  "textarea",
  "number",
  "currency",
  "boolean",
  "date",
  "datetime",
  "select",
  "multiselect",
] as const;

export const crmFieldDefinitionSchema = z.object({
  objectType: z.enum(CRM_OBJECT_TYPES),
  fieldKey: z.string().regex(/^[a-z0-9_]+$/, "Field key must be snake_case"),
  fieldLabel: z.string().min(1),
  fieldType: z.enum(FIELD_TYPE_ENUM),
  description: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z
    .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
    .optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .partial()
    .optional(),
  orderIndex: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export async function getCustomFieldDefinitions(
  tenantId: string,
  objectType: CrmObjectType,
  includeInactive = false
): Promise<CustomFieldDefinition[]> {
  return db
    .select()
    .from(customFieldDefinitions)
    .where(
      and(
        eq(customFieldDefinitions.tenantId, tenantId),
        eq(customFieldDefinitions.objectType, objectType)
      )
    )
    .then((defs) =>
      includeInactive ? defs : defs.filter((def) => def.isActive !== false)
    );
}

interface ValidationOptions {
  enforceRequired?: boolean;
  existingValues?: Record<string, any> | null;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  values: Record<string, any>;
  definitions: CustomFieldDefinition[];
}

export async function validateCustomFieldsForObject(
  tenantId: string,
  objectType: CrmObjectType,
  values: Record<string, any> | undefined | null,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const defs = await getCustomFieldDefinitions(tenantId, objectType);
  const existingValues = options.existingValues
    ? { ...options.existingValues }
    : {};
  const payload = { ...existingValues };
  const errors: string[] = [];
  const providedValues = values || {};

  const definitionMap = new Map(defs.map((def) => [def.fieldKey, def]));

  for (const [fieldKey, rawValue] of Object.entries(providedValues)) {
    const def = definitionMap.get(fieldKey);
    if (!def) {
      errors.push(`Unknown custom field "${fieldKey}" for ${objectType}`);
      continue;
    }

    const normalized = normalizeValue(def, rawValue);
    if (normalized.error) {
      errors.push(
        `Invalid value for ${def.fieldLabel}: ${normalized.errorMessage}`
      );
      continue;
    }

    payload[fieldKey] = normalized.value;
  }

  for (const def of defs) {
    const hasValue = payload[def.fieldKey] !== undefined;

    if (!hasValue && options.enforceRequired && def.required) {
      if (def.defaultValue !== null && def.defaultValue !== undefined) {
        const normalized = normalizeValue(def, def.defaultValue);
        if (normalized.error) {
          errors.push(
            `Default value invalid for ${def.fieldLabel}: ${normalized.errorMessage}`
          );
        } else {
          payload[def.fieldKey] = normalized.value;
        }
      } else {
        errors.push(`Custom field "${def.fieldLabel}" is required`);
      }
    } else if (!hasValue && def.defaultValue !== undefined) {
      const normalized = normalizeValue(def, def.defaultValue);
      if (!normalized.error) {
        payload[def.fieldKey] = normalized.value;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    values: payload,
    definitions: defs,
  };
}

function normalizeValue(
  def: CustomFieldDefinition,
  rawValue: any
): { error: boolean; errorMessage?: string; value?: any } {
  if (rawValue === undefined) {
    return { error: false };
  }

  if (rawValue === null || rawValue === "") {
    return { error: false, value: null };
  }

  try {
    switch (def.fieldType) {
      case "text":
      case "textarea": {
        if (typeof rawValue !== "string") {
          return { error: true, errorMessage: "must be a string" };
        }
        validateString(def, rawValue);
        return { error: false, value: rawValue };
      }
      case "number":
      case "currency": {
        const num = Number(rawValue);
        if (Number.isNaN(num)) {
          return { error: true, errorMessage: "must be a number" };
        }
        validateNumber(def, num);
        return { error: false, value: num };
      }
      case "boolean": {
        const bool =
          typeof rawValue === "boolean"
            ? rawValue
            : rawValue === "true"
              ? true
              : rawValue === "false"
                ? false
                : null;
        if (bool === null) {
          return { error: true, errorMessage: "must be true or false" };
        }
        return { error: false, value: bool };
      }
      case "date":
      case "datetime": {
        const date = new Date(rawValue);
        if (Number.isNaN(date.getTime())) {
          return { error: true, errorMessage: "invalid date" };
        }
        return { error: false, value: date.toISOString() };
      }
      case "select": {
        if (typeof rawValue !== "string") {
          return { error: true, errorMessage: "must be a string" };
        }
        if (
          def.options &&
          def.options.length > 0 &&
          !def.options.some((opt) => opt.value === rawValue)
        ) {
          return {
            error: true,
            errorMessage: `must be one of: ${def.options
              .map((opt) => opt.value)
              .join(", ")}`,
          };
        }
        return { error: false, value: rawValue };
      }
      case "multiselect": {
        const arr = Array.isArray(rawValue) ? rawValue : [rawValue];
        const normalizedValues = arr.map((item) => String(item));
        if (
          def.options &&
          def.options.length > 0 &&
          normalizedValues.some(
            (value) => !def.options!.some((opt) => opt.value === value)
          )
        ) {
          return {
            error: true,
            errorMessage: `contains invalid value. Allowed: ${def.options
              .map((opt) => opt.value)
              .join(", ")}`,
          };
        }
        return { error: false, value: normalizedValues };
      }
      default:
        return { error: true, errorMessage: "unsupported field type" };
    }
  } catch (err: any) {
    return { error: true, errorMessage: err.message || "invalid value" };
  }
}

function validateNumber(def: CustomFieldDefinition, value: number) {
  const rules = def.validation || {};
  if (typeof rules.min === "number" && value < rules.min) {
    throw new Error(`must be >= ${rules.min}`);
  }
  if (typeof rules.max === "number" && value > rules.max) {
    throw new Error(`must be <= ${rules.max}`);
  }
}

function validateString(def: CustomFieldDefinition, value: string) {
  const rules = def.validation || {};
  if (typeof rules.min === "number" && value.length < rules.min) {
    throw new Error(`must be at least ${rules.min} characters`);
  }
  if (typeof rules.max === "number" && value.length > rules.max) {
    throw new Error(`must be under ${rules.max} characters`);
  }
  if (rules.pattern) {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(value)) {
      throw new Error("does not match the required pattern");
    }
  }
}

