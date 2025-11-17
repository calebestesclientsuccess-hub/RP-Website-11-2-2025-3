
-- Create security_events table for security audit logging
CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  endpoint TEXT,
  method TEXT,
  details JSONB,
  resolved BOOLEAN DEFAULT false NOT NULL,
  resolved_at TIMESTAMP,
  resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_security_events_tenant ON security_events(tenant_id);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX idx_security_events_unresolved ON security_events(resolved) WHERE resolved = false;
