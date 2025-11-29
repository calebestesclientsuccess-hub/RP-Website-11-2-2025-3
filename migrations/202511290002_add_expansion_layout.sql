-- Add expansion layout mode for portfolio grid
-- 'vertical' = inline expansion (default, existing behavior)
-- 'cinematic' = slide-over panel with grid displacement (desktop only)

ALTER TABLE "projects"
ADD COLUMN IF NOT EXISTS "expansion_layout" text DEFAULT 'vertical';

