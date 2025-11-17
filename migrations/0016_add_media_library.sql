
CREATE TABLE IF NOT EXISTS "media_library" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text DEFAULT 'default' NOT NULL,
  "cloudinary_public_id" text NOT NULL,
  "cloudinary_url" text NOT NULL,
  "media_type" text NOT NULL,
  "label" text,
  "tags" text[],
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "projects" ADD COLUMN "brand_color_primary" text;
ALTER TABLE "projects" ADD COLUMN "brand_color_secondary" text;
ALTER TABLE "projects" ADD COLUMN "brand_color_tertiary" text;
ALTER TABLE "projects" ADD COLUMN "logo_media_id" text;
ALTER TABLE "projects" ADD COLUMN "primary_image_id" text;
