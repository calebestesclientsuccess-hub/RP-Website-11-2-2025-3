CREATE TABLE IF NOT EXISTS replicate_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text NOT NULL UNIQUE,
  tenant_id varchar NOT NULL REFERENCES tenants(id),
  user_id varchar REFERENCES users(id),
  prompt text NOT NULL,
  aspect_ratio text NOT NULL,
  stylize integer NOT NULL DEFAULT 100,
  count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'queued',
  replicate_prediction_id text,
  output_urls jsonb,
  media_library_asset_ids jsonb,
  error_message text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS replicate_jobs_tenant_idx ON replicate_jobs (tenant_id);

