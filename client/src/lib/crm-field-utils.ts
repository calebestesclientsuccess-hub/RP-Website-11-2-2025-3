import type { CustomFieldDefinition, FormField } from "@shared/schema";

export const SUPPORTED_CRM_FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "currency",
  "boolean",
  "date",
  "datetime",
  "select",
] as const;

export type SupportedCrmFieldType = (typeof SUPPORTED_CRM_FIELD_TYPES)[number];

export function mapDefinitionToFormField(def: CustomFieldDefinition): FormField {
  const placeholder =
    def.description ||
    (def.fieldType === "date"
      ? "YYYY-MM-DD"
      : def.fieldType === "datetime"
        ? "YYYY-MM-DD HH:mm"
        : undefined);

  const fieldType = mapFieldTypeToFormInput(def.fieldType as SupportedCrmFieldType);

  const field: FormField = {
    name: def.fieldKey,
    label: def.fieldLabel,
    type: fieldType,
    required: def.required ?? false,
    placeholder,
  };

  if (fieldType === "select" && def.options) {
    field.options = def.options;
  }

  return field;
}

export function mapFieldTypeToFormInput(type: SupportedCrmFieldType): FormField["type"] {
  switch (type) {
    case "textarea":
      return "textarea";
    case "number":
    case "currency":
      return "number";
    case "boolean":
      return "checkbox";
    case "select":
      return "select";
    default:
      return "text";
  }
}

export function coerceDefaultValue(type: SupportedCrmFieldType, rawValue?: string | null) {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return null;
  }

  switch (type) {
    case "number":
    case "currency":
      return Number(rawValue);
    case "boolean":
      return rawValue === "true";
    default:
      return rawValue;
  }
}

