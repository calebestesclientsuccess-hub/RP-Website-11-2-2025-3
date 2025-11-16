
import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Store Web Vitals metrics
router.post('/api/analytics/web-vitals', async (req, res) => {
  try {
    const { name, value, rating, delta, id, navigationType } = req.body;

    // Handle null navigationType in JavaScript before SQL execution
    const navType = navigationType || 'navigate';

    // Store in database
    await db.execute(sql`
      INSERT INTO web_vitals_metrics (name, value, rating, delta, metric_id, navigation_type, created_at)
      VALUES (${name}, ${value}, ${rating}, ${delta}, ${id}, ${navType}, CURRENT_TIMESTAMP)
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
      WHERE created_at > NOW() - (${days}::text || ' days')::interval
      GROUP BY name
    `);

    res.json(metrics.rows || metrics);
  } catch (error) {
    console.error('Web Vitals summary error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
