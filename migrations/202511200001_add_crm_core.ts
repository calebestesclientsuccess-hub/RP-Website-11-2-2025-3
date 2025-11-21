import { sql } from 'drizzle-orm';

export const up = async (db) => {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS custom_field_definitions (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      object_type TEXT NOT NULL,
      field_key TEXT NOT NULL,
      field_label TEXT NOT NULL,
      field_type TEXT NOT NULL,
      description TEXT,
      required BOOLEAN NOT NULL DEFAULT false,
      options JSONB NOT NULL DEFAULT '[]'::jsonb,
      validation JSONB NOT NULL DEFAULT '{}'::jsonb,
      default_value JSONB,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (tenant_id, object_type, field_key)
    );
  `);

  await db.run(sql`
    ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;
  `);

  await db.run(sql`
    ALTER TABLE contacts
    ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS deals (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      company_id VARCHAR(255) REFERENCES companies(id) ON DELETE SET NULL,
      contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE SET NULL,
      owner_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      description TEXT,
      stage TEXT NOT NULL DEFAULT 'qualification',
      status TEXT NOT NULL DEFAULT 'open',
      amount INTEGER,
      currency TEXT NOT NULL DEFAULT 'USD',
      probability INTEGER,
      source TEXT,
      close_date TIMESTAMP,
      custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS emails (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      company_id VARCHAR(255) REFERENCES companies(id) ON DELETE SET NULL,
      contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE SET NULL,
      deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE SET NULL,
      owner_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
      subject TEXT NOT NULL,
      body TEXT,
      direction TEXT NOT NULL DEFAULT 'outbound',
      status TEXT NOT NULL DEFAULT 'logged',
      sent_at TIMESTAMP,
      custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS phone_calls (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      company_id VARCHAR(255) REFERENCES companies(id) ON DELETE SET NULL,
      contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE SET NULL,
      deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE SET NULL,
      owner_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
      call_type TEXT NOT NULL DEFAULT 'outbound',
      subject TEXT,
      notes TEXT,
      duration_seconds INTEGER,
      called_at TIMESTAMP,
      outcome TEXT,
      custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS meetings (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      company_id VARCHAR(255) REFERENCES companies(id) ON DELETE SET NULL,
      contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE SET NULL,
      deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE SET NULL,
      owner_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      agenda TEXT,
      meeting_type TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      location TEXT,
      conferencing_link TEXT,
      custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      company_id VARCHAR(255) REFERENCES companies(id) ON DELETE SET NULL,
      contact_id VARCHAR(255) REFERENCES contacts(id) ON DELETE SET NULL,
      deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE SET NULL,
      owner_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'normal',
      due_date TIMESTAMP,
      completed_at TIMESTAMP,
      reminder_at TIMESTAMP,
      custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = async (db) => {
  await db.run(sql`ALTER TABLE contacts DROP COLUMN IF EXISTS custom_fields;`);
  await db.run(sql`ALTER TABLE companies DROP COLUMN IF EXISTS custom_fields;`);
  await db.run(sql`DROP TABLE IF EXISTS tasks;`);
  await db.run(sql`DROP TABLE IF EXISTS meetings;`);
  await db.run(sql`DROP TABLE IF EXISTS phone_calls;`);
  await db.run(sql`DROP TABLE IF EXISTS emails;`);
  await db.run(sql`DROP TABLE IF EXISTS deals;`);
  await db.run(sql`DROP TABLE IF EXISTS custom_field_definitions;`);
};

