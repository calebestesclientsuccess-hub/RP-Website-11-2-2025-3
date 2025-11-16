
import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Store Web Vitals metrics
router.post('/api/analytics/web-vitals', async (req, res) => {
  try {
    const { name, value, rating, delta, id, navigationType } = req.body;

    // Store in database
    await db.execute(sql`
      INSERT INTO web_vitals_metrics (name, value, rating, delta, metric_id, navigation_type, created_at)
      VALUES (${name}, ${value}, ${rating}, ${delta}, ${id}, ${navigationType}, CURRENT_TIMESTAMP)
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
        AVG(value) as avg_value,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
        COUNT(*) as sample_count,
        SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END)::float / COUNT(*) as good_rate
      FROM web_vitals_metrics
      WHERE created_at > NOW() - INTERVAL '${days} days'
      GROUP BY name
    `);

    res.json(metrics);
  } catch (error) {
    console.error('Web Vitals summary error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
