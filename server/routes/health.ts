
import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Basic liveness check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detailed readiness check
router.get('/health/ready', async (req, res) => {
  const checks = {
    database: false,
    gemini: false,
    cloudinary: false,
  };
  
  try {
    // Database check
    await db.execute(sql`SELECT 1`);
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }
  
  try {
    // Gemini API check (if key exists)
    if (process.env.GEMINI_API_KEY) {
      checks.gemini = true;
    }
  } catch (error) {
    console.error('Gemini health check failed:', error);
  }
  
  try {
    // Cloudinary check
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      checks.cloudinary = true;
    }
  } catch (error) {
    console.error('Cloudinary health check failed:', error);
  }
  
  const allHealthy = Object.values(checks).every(v => v);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});

// Metrics endpoint
router.get('/health/metrics', async (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    uptime: Math.floor(uptime),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
    },
    nodejs: process.version,
    timestamp: new Date().toISOString(),
  });
});

export default router;
