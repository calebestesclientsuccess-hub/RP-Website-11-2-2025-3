
CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" varchar NOT NULL REFERENCES "tenants"("id"),
  "flag_key" text NOT NULL,
  "flag_name" text NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("tenant_id", "flag_key")
);
