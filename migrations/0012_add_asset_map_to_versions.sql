
-- Add asset_map column to portfolio_versions for placeholder-to-URL mapping
ALTER TABLE portfolio_versions ADD COLUMN IF NOT EXISTS asset_map JSONB DEFAULT '{}'::jsonb;

-- Create index for faster asset map queries
CREATE INDEX IF NOT EXISTS idx_portfolio_versions_asset_map ON portfolio_versions USING gin (asset_map);
