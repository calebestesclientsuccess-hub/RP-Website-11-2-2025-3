
-- Add portfolio_versions table for conversation-based refinement
CREATE TABLE IF NOT EXISTS portfolio_versions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  scenes_json JSONB NOT NULL,
  confidence_score INTEGER,
  confidence_factors JSONB,
  change_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, version_number)
);

CREATE INDEX idx_portfolio_versions_project ON portfolio_versions(project_id);
CREATE INDEX idx_portfolio_versions_created ON portfolio_versions(created_at DESC);
