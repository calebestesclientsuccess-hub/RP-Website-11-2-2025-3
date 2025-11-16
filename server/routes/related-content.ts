
import { Router } from 'express';
import { db } from '../db';
import { blogPosts } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { calculateSimilarity } from '../utils/internal-linking';

const router = Router();

// Get related posts for a blog post
router.get('/api/blog-posts/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const maxResults = parseInt(req.query.max as string) || 3;

    const currentPost = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, id)
    });

    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const allPosts = await db.select().from(blogPosts)
      .where(eq(blogPosts.published, true));

    const relatedPosts = allPosts
      .filter(post => post.id !== id)
      .map(post => ({
        ...post,
        similarity: calculateSimilarity(currentPost, post, allPosts)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults)
      .map(({ id, slug, title, excerpt, category, similarity }) => ({
        id,
        slug,
        title,
        excerpt,
        category,
        similarity
      }));

    res.json(relatedPosts);
  } catch (error) {
    console.error('Related content error:', error);
    res.status(500).json({ error: 'Failed to fetch related content' });
  }
});

export default router;
