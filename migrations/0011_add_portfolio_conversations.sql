
-- Add portfolio_conversations for persistent refinement context
CREATE TABLE IF NOT EXISTS portfolio_conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  version_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_version FOREIGN KEY (version_id) REFERENCES portfolio_versions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_portfolio_conversations_project ON portfolio_conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_conversations_timestamp ON portfolio_conversations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_conversations_version ON portfolio_conversations(version_id);
