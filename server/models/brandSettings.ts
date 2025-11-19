import { pgTable, serial, text, jsonb, varchar } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';

export const brandSettings = pgTable('brand_settings', {
  id: serial('id').primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  logoUrl: text('logo_url'),
  colors: jsonb('colors'), // { primary: '#...', secondary: '#...' }
  componentLibrary: varchar('component_library', { length: 50 }),
  createdAt: text('created_at').defaultNow(),
  updatedAt: text('updated_at').defaultNow(),
});

export type BrandSettings = InferModel<typeof brandSettings>;
export type NewBrandSettings = InferModel<typeof brandSettings, 'insert'>;
