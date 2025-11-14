
import { Router } from 'express';
import { db } from '../db';
import { blogPosts } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/api/seo/health-check', async (req, res) => {
  try {
    const posts = await db.select().from(blogPosts).where(eq(blogPosts.published, true));
    
    const issues = [];
    
    // Check for missing meta descriptions
    const missingMetaDesc = posts.filter(p => !p.metaDescription || p.metaDescription.length < 120);
    if (missingMetaDesc.length > 0) {
      issues.push({
        severity: 'high',
        type: 'missing_meta_description',
        count: missingMetaDesc.length,
        items: missingMetaDesc.map(p => p.slug)
      });
    }
    
    // Check for short titles
    const shortTitles = posts.filter(p => p.title.length < 30);
    if (shortTitles.length > 0) {
      issues.push({
        severity: 'medium',
        type: 'short_title',
        count: shortTitles.length,
        items: shortTitles.map(p => p.slug)
      });
    }
    
    // Check for missing featured images
    const missingImages = posts.filter(p => !p.featuredImage);
    if (missingImages.length > 0) {
      issues.push({
        severity: 'medium',
        type: 'missing_featured_image',
        count: missingImages.length,
        items: missingImages.map(p => p.slug)
      });
    }
    
    res.json({
      status: issues.length === 0 ? 'healthy' : 'issues_found',
      totalPosts: posts.length,
      issues,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('SEO health check error:', error);
    res.status(500).json({ error: 'Failed to run SEO health check' });
  }
});

export default router;
