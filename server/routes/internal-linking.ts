
import { Router } from 'express';
import { db } from '../db';
import { blogPosts } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { generateLinkSuggestions, autoInsertLinks } from '../utils/internal-linking';

const router = Router();

// Get link suggestions for a blog post
router.get('/api/internal-links/suggestions/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const maxSuggestions = parseInt(req.query.max as string) || 5;

    const currentPost = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, postId)
    });

    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const allPosts = await db.select().from(blogPosts);
    const suggestions = generateLinkSuggestions(currentPost, allPosts, maxSuggestions);

    res.json(suggestions);
  } catch (error) {
    console.error('Link suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate link suggestions' });
  }
});

// Auto-insert links into content
router.post('/api/internal-links/auto-insert', async (req, res) => {
  try {
    const { postId, maxLinks = 3 } = req.body;

    const currentPost = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, postId)
    });

    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const allPosts = await db.select().from(blogPosts);
    const suggestions = generateLinkSuggestions(currentPost, allPosts, 10);
    const modifiedContent = autoInsertLinks(currentPost.content, suggestions, maxLinks);

    res.json({ 
      content: modifiedContent,
      linksInserted: suggestions.length
    });
  } catch (error) {
    console.error('Auto-insert error:', error);
    res.status(500).json({ error: 'Failed to auto-insert links' });
  }
});

export default router;
