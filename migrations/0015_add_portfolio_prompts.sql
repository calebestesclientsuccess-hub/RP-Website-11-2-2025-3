
-- Create portfolio_prompts table for per-portfolio AI prompt customization
CREATE TABLE IF NOT EXISTS portfolio_prompts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN (
    'artistic_director',
    'technical_director',
    'executive_producer',
    'split_specialist',
    'gallery_specialist',
    'quote_specialist',
    'fullscreen_specialist'
  )),
  custom_prompt TEXT,
  is_active BOOLEAN DEFAULT false NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_portfolio_prompts_project ON portfolio_prompts(project_id);
CREATE INDEX idx_portfolio_prompts_type ON portfolio_prompts(prompt_type);
CREATE INDEX idx_portfolio_prompts_active ON portfolio_prompts(is_active) WHERE is_active = true;

-- Create composite index for common query pattern
CREATE INDEX idx_portfolio_prompts_project_type_active ON portfolio_prompts(project_id, prompt_type, is_active);

-- Ensure only one active prompt per project+type combination (partial unique index)
CREATE UNIQUE INDEX idx_portfolio_prompts_unique_active ON portfolio_prompts(project_id, prompt_type) WHERE is_active = true;
