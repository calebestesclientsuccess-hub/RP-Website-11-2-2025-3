
import { Router } from 'express';
import { db } from '../db';
import { blogPosts } from '@shared/schema';
import { eq, desc, and, inArray, ne } from 'drizzle-orm';

const router = Router();

// Get recommended/related posts for a blog post
// Returns manually selected articles if set, otherwise fills with most recent posts
router.get('/api/blog-posts/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const maxResults = parseInt(req.query.max as string) || 3;

    // Fetch current post to get recommendedArticleIds
    const currentPost = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, id)
    });

    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const result: Array<{
      id: string;
      slug: string;
      title: string;
      excerpt: string;
      featuredImage: string | null;
    }> = [];

    const excludeIds = new Set<string>([id]);

    // Step 1: If manually selected articles exist, fetch them first
    const manualIds = currentPost.recommendedArticleIds?.filter(Boolean) || [];
    
    if (manualIds.length > 0) {
      const manualPosts = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        publishedAt: blogPosts.publishedAt,
      })
        .from(blogPosts)
        .where(and(
          inArray(blogPosts.id, manualIds),
          eq(blogPosts.published, true)
        ));

      // Maintain the order from recommendedArticleIds
      for (const manualId of manualIds) {
        const post = manualPosts.find(p => p.id === manualId);
        if (post && result.length < maxResults) {
          result.push({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
          });
          excludeIds.add(post.id);
        }
      }
    }

    // Step 2: If we need more articles, fill with most recent posts
    if (result.length < maxResults) {
      const remainingCount = maxResults - result.length;
      
      const recentPosts = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
      })
        .from(blogPosts)
        .where(eq(blogPosts.published, true))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(remainingCount + excludeIds.size); // Fetch extra to account for exclusions

      for (const post of recentPosts) {
        if (result.length >= maxResults) break;
        if (!excludeIds.has(post.id)) {
          result.push({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
          });
        }
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Related content error:', error);
    res.status(500).json({ error: 'Failed to fetch related content' });
  }
});

export default router;
