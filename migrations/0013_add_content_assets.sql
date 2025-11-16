-- Create content_assets table for inline asset creation
CREATE TABLE IF NOT EXISTS content_assets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'quote')),
  
  -- Common fields
  title TEXT,
  tags TEXT[],
  
  -- Image-specific
  image_url TEXT,
  alt_text TEXT,
  
  -- Video-specific
  video_url TEXT,
  video_caption TEXT,
  duration INTEGER,
  
  -- Quote-specific
  quote_text TEXT,
  quote_author TEXT,
  quote_role TEXT,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_assets_tenant_id ON content_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_type ON content_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_content_assets_created_at ON content_assets(created_at DESC);
