
import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// POST /api/analytics/web-vitals - Track Web Vitals metrics
router.post('/web-vitals', async (req, res) => {
  try {
    const { name, value, rating, id, navigationType } = req.body;

    if (!name || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, value' });
    }

    await db.execute(sql`
      INSERT INTO web_vitals (metric_name, metric_value, rating, metric_id, navigation_type, user_agent, page_url)
      VALUES (${name}, ${value}, ${rating || null}, ${id || null}, ${navigationType || null}, ${req.headers['user-agent'] || null}, ${req.headers.referer || null})
    `);

    res.json({ success: true });
  } catch (error) {
    console.error('Web Vitals tracking error:', error);
    res.status(500).json({ error: 'Failed to record metric' });
  }
});

export default router;

const router = Router();

// Store Web Vitals metrics
router.post('/api/analytics/web-vitals', async (req, res) => {
  try {
    const { name, value, rating, delta, id, navigationType } = req.body;

    // Handle null navigationType in JavaScript before SQL execution
    const navType = navigationType || 'navigate';

    // Store in database - use parameterized values properly
    await db.execute(sql`
      INSERT INTO web_vitals_metrics (name, value, rating, delta, metric_id, navigation_type, created_at)
      VALUES (${name}, ${Number(value)}, ${rating}, ${Number(delta)}, ${id}, ${navType}, CURRENT_TIMESTAMP)
      ON CONFLICT (metric_id) DO NOTHING
    `);

    res.status(204).send();
  } catch (error) {
    console.error('Web Vitals tracking error:', error);
    res.status(500).json({ error: 'Failed to record metric' });
  }
});

// Get Web Vitals dashboard data
router.get('/api/analytics/web-vitals/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    
    const metrics = await db.execute(sql`
      SELECT 
        name,
        AVG(value)::numeric(10,2) as avg_value,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value)::numeric(10,2) as p75,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value)::numeric(10,2) as p95,
        COUNT(*)::integer as sample_count,
        (SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0) * 100)::numeric(5,2) as good_rate_percent
      FROM web_vitals_metrics
      WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
      GROUP BY name
    `);

    res.json(metrics.rows || metrics);
  } catch (error) {
    console.error('Web Vitals summary error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
