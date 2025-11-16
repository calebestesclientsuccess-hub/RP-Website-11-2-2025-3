
-- Create AI Prompt Templates table
CREATE TABLE "ai_prompt_templates" (
  "id" text PRIMARY KEY NOT NULL,
  "prompt_key" text NOT NULL UNIQUE,
  "prompt_name" text NOT NULL,
  "prompt_description" text,
  "system_prompt" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create index on prompt_key for faster lookups
CREATE INDEX "ai_prompt_templates_key_idx" ON "ai_prompt_templates" ("prompt_key");

-- Create index on is_active for filtering
CREATE INDEX "ai_prompt_templates_active_idx" ON "ai_prompt_templates" ("is_active");
