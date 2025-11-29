-- Add hero video support to projects table
-- Allows hero media to be either image or video

ALTER TABLE "projects"
ADD COLUMN IF NOT EXISTS "hero_media_type" text DEFAULT 'image',
ADD COLUMN IF NOT EXISTS "hero_media_config" jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN "projects"."hero_media_type" IS 'Type of hero media: image or video';
COMMENT ON COLUMN "projects"."hero_media_config" IS 'Configuration for hero media including videoUrl, posterUrl, autoplay settings';

