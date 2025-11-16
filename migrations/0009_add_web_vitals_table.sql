
-- Create web_vitals_metrics table for RUM tracking
CREATE TABLE IF NOT EXISTS web_vitals_metrics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  rating VARCHAR(20) NOT NULL,
  delta NUMERIC(10, 2) NOT NULL,
  metric_id VARCHAR(100) UNIQUE NOT NULL,
  navigation_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  url TEXT
);

-- Create indexes for performance
CREATE INDEX idx_web_vitals_name ON web_vitals_metrics(name);
CREATE INDEX idx_web_vitals_created_at ON web_vitals_metrics(created_at);
CREATE INDEX idx_web_vitals_rating ON web_vitals_metrics(rating);

-- Create view for dashboard queries
CREATE OR REPLACE VIEW web_vitals_summary AS
SELECT 
  name,
  COUNT(*) as sample_count,
  AVG(value) as avg_value,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
  ROUND(
    SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100,
    2
  ) as good_rate_percent
FROM web_vitals_metrics
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY name;
