
-- Add category field to scene_templates
ALTER TABLE scene_templates ADD COLUMN IF NOT EXISTS category TEXT;

-- Add lastUsedAt field to scene_templates
ALTER TABLE scene_templates ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP;

-- Create index on category
CREATE INDEX IF NOT EXISTS idx_scene_templates_category ON scene_templates(category);

-- Create composite search index on name and description
CREATE INDEX IF NOT EXISTS idx_scene_templates_search ON scene_templates(name, description);

-- Add comment for documentation
COMMENT ON COLUMN scene_templates.category IS 'Scene category for filtering (e.g., Hero, Content, Gallery, Quote, Fullscreen)';
COMMENT ON COLUMN scene_templates.last_used_at IS 'Timestamp when template was last used in a project';
