import { pgTable, serial, text, jsonb, varchar } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';

export const layoutDrafts = pgTable('layout_drafts', {
    id: serial('id').primaryKey(),
    tenantId: varchar('tenant_id', { length: 36 }).notNull(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    draftJson: jsonb('draft_json'), // stores the intermediate wizard state
    createdAt: text('created_at').defaultNow(),
    updatedAt: text('updated_at').defaultNow(),
});

export type LayoutDraft = InferModel<typeof layoutDrafts>;
export type NewLayoutDraft = InferModel<typeof layoutDrafts, 'insert'>;
