
-- Add tenant_id column to users table
ALTER TABLE "users" ADD COLUMN "tenant_id" varchar NOT NULL DEFAULT 'tnt_revenueparty_default';

-- Add foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;

-- Add unique constraints for username and email per tenant
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_username_unique" UNIQUE("tenant_id", "username");
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_email_unique" UNIQUE("tenant_id", "email");
