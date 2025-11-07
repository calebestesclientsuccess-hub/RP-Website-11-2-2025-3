
import { Router } from 'express';
import { db } from '../db';
import { blogPosts } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

const router = Router();

router.get('/sitemap-dynamic.xml', async (req, res) => {
  try {
    const posts = await db
      .select({
        slug: blogPosts.slug,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.publishedAt));

    const baseUrl = 'https://revenueparty.com';
    const currentDate = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

    // Add blog posts dynamically
    posts.forEach(post => {
      const lastmod = post.updatedAt 
        ? new Date(post.updatedAt).toISOString().split('T')[0]
        : currentDate;
      
      xml += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
