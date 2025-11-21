import { Router, type Request, type Response } from "express";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  companies,
  contacts,
  customFieldDefinitions,
  deals,
  emails,
  insertCompanySchema,
  insertContactSchema,
  insertDealSchema,
  insertEmailSchema,
  insertMeetingSchema,
  insertPhoneCallSchema,
  insertTaskSchema,
  meetings,
  phoneCalls,
  tasks,
} from "@shared/schema";
import { DEFAULT_TENANT_ID } from "../middleware/tenant";
import {
  CRM_OBJECT_TYPES,
  type CrmObjectType,
  crmFieldDefinitionSchema,
  validateCustomFieldsForObject,
} from "../services/crm-field-service";

const router = Router();

const listQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(25),
  sort: z.enum(["createdAt", "updatedAt"]).optional().default("createdAt"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

type ListQuery = z.infer<typeof listQuerySchema>;

type TableShape = typeof companies | typeof contacts | typeof deals | typeof emails | typeof phoneCalls | typeof meetings | typeof tasks;

interface CrmEntityConfig {
  basePath: string;
  objectType: CrmObjectType;
  table: TableShape;
  insertSchema: z.ZodTypeAny;
  updateSchema: z.ZodTypeAny;
  searchableColumns: any[];
  orderColumn: any;
}

const crmEntityConfigs: CrmEntityConfig[] = [
  {
    basePath: "companies",
    objectType: "company",
    table: companies,
    insertSchema: insertCompanySchema,
    updateSchema: insertCompanySchema.partial(),
    searchableColumns: [companies.name, companies.domain, companies.industry],
    orderColumn: companies.createdAt,
  },
  {
    basePath: "contacts",
    objectType: "contact",
    table: contacts,
    insertSchema: insertContactSchema,
    updateSchema: insertContactSchema.partial(),
    searchableColumns: [contacts.email, contacts.firstName, contacts.lastName],
    orderColumn: contacts.createdAt,
  },
  {
    basePath: "deals",
    objectType: "deal",
    table: deals,
    insertSchema: insertDealSchema,
    updateSchema: insertDealSchema.partial(),
    searchableColumns: [deals.name, deals.status, deals.stage, deals.source],
    orderColumn: deals.updatedAt,
  },
  {
    basePath: "emails",
    objectType: "email",
    table: emails,
    insertSchema: insertEmailSchema,
    updateSchema: insertEmailSchema.partial(),
    searchableColumns: [emails.subject, emails.status, emails.direction],
    orderColumn: emails.createdAt,
  },
  {
    basePath: "phone-calls",
    objectType: "phone_call",
    table: phoneCalls,
    insertSchema: insertPhoneCallSchema,
    updateSchema: insertPhoneCallSchema.partial(),
    searchableColumns: [phoneCalls.subject, phoneCalls.callType, phoneCalls.outcome],
    orderColumn: phoneCalls.createdAt,
  },
  {
    basePath: "meetings",
    objectType: "meeting",
    table: meetings,
    insertSchema: insertMeetingSchema,
    updateSchema: insertMeetingSchema.partial(),
    searchableColumns: [meetings.title, meetings.meetingType, meetings.status, meetings.location],
    orderColumn: meetings.startTime,
  },
  {
    basePath: "tasks",
    objectType: "task",
    table: tasks,
    insertSchema: insertTaskSchema,
    updateSchema: insertTaskSchema.partial(),
    searchableColumns: [tasks.title, tasks.status, tasks.priority],
    orderColumn: tasks.dueDate,
  },
];

router.get("/crm/custom-fields/:objectType", async (req, res) => {
  const tenantId = getTenantId(req);
  const objectType = req.params.objectType as CrmObjectType;

  if (!CRM_OBJECT_TYPES.includes(objectType)) {
    return res.status(400).json({ error: "Unsupported object type" });
  }

  const fields = await db
    .select()
    .from(customFieldDefinitions)
    .where(
      and(
        eq(customFieldDefinitions.tenantId, tenantId),
        eq(customFieldDefinitions.objectType, objectType)
      )
    )
    .orderBy(asc(customFieldDefinitions.orderIndex), asc(customFieldDefinitions.fieldLabel));

  res.json(fields);
});

router.post("/crm/custom-fields", async (req, res) => {
  const tenantId = getTenantId(req);
  const parsed = crmFieldDefinitionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: fromZodError(parsed.error).message });
  }

  const payload = parsed.data;

  const insertPayload = {
    tenantId,
    objectType: payload.objectType,
    fieldKey: payload.fieldKey,
    fieldLabel: payload.fieldLabel,
    fieldType: payload.fieldType,
    description: payload.description,
    required: payload.required ?? false,
    options: payload.options || [],
    validation: payload.validation || {},
    defaultValue: payload.defaultValue ?? null,
    orderIndex: payload.orderIndex ?? 0,
    isActive: payload.isActive ?? true,
  };

  const [definition] = await db
    .insert(customFieldDefinitions)
    .values(insertPayload)
    .onConflictDoUpdate({
      target: [customFieldDefinitions.tenantId, customFieldDefinitions.objectType, customFieldDefinitions.fieldKey],
      set: {
        fieldLabel: insertPayload.fieldLabel,
        fieldType: insertPayload.fieldType,
        description: insertPayload.description,
        required: insertPayload.required,
        options: insertPayload.options,
        validation: insertPayload.validation,
        defaultValue: insertPayload.defaultValue,
        orderIndex: insertPayload.orderIndex,
        isActive: insertPayload.isActive,
        updatedAt: new Date(),
      },
    })
    .returning();

  res.status(201).json(definition);
});

router.put("/crm/custom-fields/:id", async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;

  const parsed = crmFieldDefinitionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: fromZodError(parsed.error).message });
  }

  const [existing] = await db
    .select()
    .from(customFieldDefinitions)
    .where(and(eq(customFieldDefinitions.id, id), eq(customFieldDefinitions.tenantId, tenantId)))
    .limit(1);

  if (!existing) {
    return res.status(404).json({ error: "Field definition not found" });
  }

  const updatePayload: Record<string, any> = { ...parsed.data, updatedAt: new Date() };

  const [updated] = await db
    .update(customFieldDefinitions)
    .set(updatePayload)
    .where(eq(customFieldDefinitions.id, id))
    .returning();

  res.json(updated);
});

router.delete("/crm/custom-fields/:id", async (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;

  const [existing] = await db
    .select()
    .from(customFieldDefinitions)
    .where(and(eq(customFieldDefinitions.id, id), eq(customFieldDefinitions.tenantId, tenantId)))
    .limit(1);

  if (!existing) {
    return res.status(404).json({ error: "Field definition not found" });
  }

  await db.delete(customFieldDefinitions).where(eq(customFieldDefinitions.id, id));
  res.status(204).send();
});

for (const config of crmEntityConfigs) {
  registerCrudRoutes(config);
}

function registerCrudRoutes(config: CrmEntityConfig) {
  const baseRoute = `/crm/${config.basePath}`;

  router.get(baseRoute, async (req, res) => {
    const tenantId = getTenantId(req);
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: fromZodError(parsed.error).message });
    }
    const query = parsed.data;
    const response = await listRecords(config, tenantId, query);
    res.json(response);
  });

  router.get(`${baseRoute}/:id`, async (req, res) => {
    const tenantId = getTenantId(req);
    const { id } = req.params;
    const record = await fetchRecordById(config, tenantId, id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json(record);
  });

  router.post(baseRoute, async (req, res) => {
    const tenantId = getTenantId(req);
    const parsed = config.insertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: fromZodError(parsed.error).message });
    }

    const { customFields, ...rest } = parsed.data as Record<string, any>;
    const customFieldResult = await validateCustomFieldsForObject(
      tenantId,
      config.objectType,
      customFields,
      { enforceRequired: true }
    );

    if (!customFieldResult.valid) {
      return res.status(400).json({ error: customFieldResult.errors.join(", ") });
    }

    const payload = {
      ...rest,
      tenantId,
      customFields: customFieldResult.values,
    };

    if (tableHasColumn(config.table, "updatedAt")) {
      payload.updatedAt = new Date();
    }

    const [record] = await db.insert(config.table).values(payload).returning();
    res.status(201).json(record);
  });

  router.put(`${baseRoute}/:id`, async (req, res) => {
    const tenantId = getTenantId(req);
    const { id } = req.params;
    const parsed = config.updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: fromZodError(parsed.error).message });
    }

    const existing = await fetchRecordById(config, tenantId, id);
    if (!existing) {
      return res.status(404).json({ error: "Record not found" });
    }

    const { customFields, ...rest } = parsed.data as Record<string, any>;
    const updatePayload: Record<string, any> = { ...rest };

    if (customFields !== undefined) {
      const customFieldResult = await validateCustomFieldsForObject(
        tenantId,
        config.objectType,
        customFields,
        { existingValues: existing.customFields || {} }
      );

      if (!customFieldResult.valid) {
        return res.status(400).json({ error: customFieldResult.errors.join(", ") });
      }

      updatePayload.customFields = customFieldResult.values;
    }

    if (tableHasColumn(config.table, "updatedAt")) {
      updatePayload.updatedAt = new Date();
    }

    const [record] = await db
      .update(config.table)
      .set(updatePayload)
      .where(and(eq(config.table.id, id), eq(config.table.tenantId, tenantId)))
      .returning();

    res.json(record);
  });

  router.delete(`${baseRoute}/:id`, async (req, res) => {
    const tenantId = getTenantId(req);
    const { id } = req.params;
    const record = await fetchRecordById(config, tenantId, id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    await db.delete(config.table).where(and(eq(config.table.id, id), eq(config.table.tenantId, tenantId)));
    res.status(204).send();
  });
}

async function listRecords(config: CrmEntityConfig, tenantId: string, query: ListQuery) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 25;
  const offset = (page - 1) * pageSize;
  const whereClauses = [eq(config.table.tenantId, tenantId)];

  const trimmedSearch = query.search?.trim();
  if (trimmedSearch && config.searchableColumns.length > 0) {
    const searchTerm = `%${trimmedSearch}%`;
    whereClauses.push(
      or(...config.searchableColumns.map((column) => ilike(column, searchTerm)))
    );
  }

  const whereExpression =
    whereClauses.length === 1 ? whereClauses[0] : and(...whereClauses);

  const orderColumn =
    query.sort === "updatedAt" && "updatedAt" in config.table
      ? config.table.updatedAt
      : config.orderColumn;

  const orderByClause =
    query.direction === "asc" ? asc(orderColumn) : desc(orderColumn);

  const data = await db
    .select()
    .from(config.table)
    .where(whereExpression)
    .orderBy(orderByClause)
    .limit(pageSize)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(config.table)
    .where(whereExpression);

  const total = totalResult[0]?.count ?? 0;

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

async function fetchRecordById(config: CrmEntityConfig, tenantId: string, id: string) {
  const [record] = await db
    .select()
    .from(config.table)
    .where(and(eq(config.table.tenantId, tenantId), eq(config.table.id, id)))
    .limit(1);
  return record;
}

function getTenantId(req: Request) {
  return req.tenantId || DEFAULT_TENANT_ID;
}

function tableHasColumn(table: Record<string, any>, column: string) {
  return Object.prototype.hasOwnProperty.call(table, column);
}

export default router;

