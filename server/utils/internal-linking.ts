
import type { BlogPost } from '@shared/schema';

interface LinkSuggestion {
  targetSlug: string;
  targetTitle: string;
  anchorText: string;
  relevanceScore: number;
  context: string;
}

/**
 * Extract keywords from content using simple TF-IDF approach
 */
function extractKeywords(content: string, allContent: string[]): Map<string, number> {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const termFreq = new Map<string, number>();
  words.forEach(word => {
    termFreq.set(word, (termFreq.get(word) || 0) + 1);
  });

  // Calculate IDF
  const idf = new Map<string, number>();
  termFreq.forEach((_, term) => {
    const docsWithTerm = allContent.filter(doc => 
      doc.toLowerCase().includes(term)
    ).length;
    idf.set(term, Math.log(allContent.length / (docsWithTerm + 1)));
  });

  // Calculate TF-IDF scores
  const scores = new Map<string, number>();
  termFreq.forEach((tf, term) => {
    const idfScore = idf.get(term) || 0;
    scores.set(term, tf * idfScore);
  });

  return scores;
}

/**
 * Calculate content similarity between two blog posts
 */
export function calculateSimilarity(
  post1: BlogPost,
  post2: BlogPost,
  allPosts: BlogPost[]
): number {
  const content1 = `${post1.title} ${post1.excerpt} ${post1.content}`;
  const content2 = `${post2.title} ${post2.excerpt} ${post2.content}`;
  const allContent = allPosts.map(p => `${p.title} ${p.excerpt} ${p.content}`);

  const keywords1 = extractKeywords(content1, allContent);
  const keywords2 = extractKeywords(content2, allContent);

  // Calculate cosine similarity
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  const allKeys = new Set([...keywords1.keys(), ...keywords2.keys()]);
  allKeys.forEach(key => {
    const score1 = keywords1.get(key) || 0;
    const score2 = keywords2.get(key) || 0;
    dotProduct += score1 * score2;
    magnitude1 += score1 * score1;
    magnitude2 += score2 * score2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Generate internal link suggestions for a blog post
 */
export function generateLinkSuggestions(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  maxSuggestions: number = 5
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  const currentContent = currentPost.content.toLowerCase();

  // Filter out current post and unpublished posts
  const candidatePosts = allPosts.filter(
    post => post.id !== currentPost.id && post.published
  );

  candidatePosts.forEach(post => {
    const similarity = calculateSimilarity(currentPost, post, allPosts);
    
    if (similarity > 0.1) { // Minimum relevance threshold
      // Find best anchor text from post title or key phrases
      const titleWords = post.title.toLowerCase().split(/\s+/);
      const anchorText = post.title;
      
      // Find context where this link could fit
      const excerptLower = post.excerpt.toLowerCase();
      const contextMatch = currentContent.indexOf(excerptLower.substring(0, 50));
      const context = contextMatch > -1 
        ? currentPost.content.substring(Math.max(0, contextMatch - 50), contextMatch + 100)
        : '';

      suggestions.push({
        targetSlug: post.slug,
        targetTitle: post.title,
        anchorText,
        relevanceScore: similarity,
        context
      });
    }
  });

  return suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxSuggestions);
}

/**
 * Auto-insert internal links into content
 */
export function autoInsertLinks(
  content: string,
  suggestions: LinkSuggestion[],
  maxLinks: number = 3
): string {
  let modifiedContent = content;
  let insertedCount = 0;

  suggestions.forEach(suggestion => {
    if (insertedCount >= maxLinks) return;

    const anchorRegex = new RegExp(
      `(?<!\\[)\\b${suggestion.anchorText}\\b(?!\\])`,
      'i'
    );
    
    if (anchorRegex.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(
        anchorRegex,
        `[${suggestion.anchorText}](/blog/${suggestion.targetSlug})`
      );
      insertedCount++;
    }
  });

  return modifiedContent;
}
