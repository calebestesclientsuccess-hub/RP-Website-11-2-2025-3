CREATE TABLE IF NOT EXISTS ai_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text NOT NULL UNIQUE,
  tenant_id varchar NOT NULL REFERENCES tenants(id),
  job_type text NOT NULL,
  provider text NOT NULL,
  model_name text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  error_message text,
  result_snippet text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS ai_gen_jobs_tenant_idx ON ai_generation_jobs (tenant_id);

