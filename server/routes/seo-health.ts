
import { Router } from 'express';
import { db } from '../db';
import { blogPosts, seoIssues } from '../../shared/schema';
import { and, eq } from 'drizzle-orm';
import { DEFAULT_TENANT_ID } from '../middleware/tenant';
import { requireAuth } from '../middleware/auth';

const router = Router();

type IssueRecord = {
  url: string;
  issueType: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
  entityId?: string;
  entityType: string;
};

const SITE_URL = (process.env.SITE_URL || 'https://revenueparty.com').replace(/\/$/, '');

router.get('/api/seo/health-check', requireAuth, async (req, res) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const posts = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
      canonicalUrl: blogPosts.canonicalUrl,
      featuredImage: blogPosts.featuredImage,
      content: blogPosts.content,
    }).from(blogPosts)
      .where(and(eq(blogPosts.tenantId, tenantId), eq(blogPosts.published, true)));

    const issues: IssueRecord[] = [];
    const addIssue = (issue: IssueRecord) => issues.push(issue);

    posts.forEach((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      if (!post.metaDescription || post.metaDescription.length < 120) {
        addIssue({
          url,
          issueType: 'missing_meta_description',
          severity: 'high',
          details: 'Meta description should be between 120-160 characters.',
          entityId: post.id,
          entityType: 'blog_post',
        });
      }

      if (post.title.length < 30) {
        addIssue({
          url,
          issueType: 'short_title',
          severity: 'medium',
          details: 'Consider expanding the title to at least 30 characters.',
          entityId: post.id,
          entityType: 'blog_post',
        });
      }

      if (!post.featuredImage) {
        addIssue({
          url,
          issueType: 'missing_featured_image',
          severity: 'medium',
          details: 'Add a featured image to improve click-through rates.',
          entityId: post.id,
          entityType: 'blog_post',
        });
      }

      if (post.canonicalUrl && post.canonicalUrl.trim() !== url) {
        addIssue({
          url,
          issueType: 'canonical_mismatch',
          severity: 'medium',
          details: `Canonical URL points to ${post.canonicalUrl}`,
          entityId: post.id,
          entityType: 'blog_post',
        });
      }
    });

    const metaTitleMap = new Map<string, string[]>();
    const metaDescriptionMap = new Map<string, string[]>();

    posts.forEach((post) => {
      const normalizedTitle = (post.metaTitle || post.title || '').trim().toLowerCase();
      if (normalizedTitle) {
        metaTitleMap.set(normalizedTitle, [...(metaTitleMap.get(normalizedTitle) || []), post.id]);
      }

      const normalizedDescription = (post.metaDescription || '').trim().toLowerCase();
      if (normalizedDescription) {
        metaDescriptionMap.set(normalizedDescription, [...(metaDescriptionMap.get(normalizedDescription) || []), post.id]);
      }
    });

    metaTitleMap.forEach((postIds) => {
      if (postIds.length > 1) {
        postIds.forEach((id) => {
          const post = posts.find((p) => p.id === id);
          if (!post) return;
          addIssue({
            url: `${SITE_URL}/blog/${post.slug}`,
            issueType: 'duplicate_meta_title',
            severity: 'high',
            details: 'Duplicate meta title detected across multiple posts.',
            entityId: id,
            entityType: 'blog_post',
          });
        });
      }
    });

    metaDescriptionMap.forEach((postIds) => {
      if (postIds.length > 1) {
        postIds.forEach((id) => {
          const post = posts.find((p) => p.id === id);
          if (!post) return;
          addIssue({
            url: `${SITE_URL}/blog/${post.slug}`,
            issueType: 'duplicate_meta_description',
            severity: 'medium',
            details: 'Duplicate meta description detected across multiple posts.',
            entityId: id,
            entityType: 'blog_post',
          });
        });
      }
    });

    const now = new Date();
    for (const issue of issues) {
      await db.insert(seoIssues)
        .values({
          tenantId,
          url: issue.url,
          issueType: issue.issueType,
          severity: issue.severity,
          status: 'open',
          details: issue.details,
          entityId: issue.entityId,
          entityType: issue.entityType,
          lastChecked: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: seoIssues.uniqueIssue,
          set: {
            url: issue.url,
            details: issue.details,
            severity: issue.severity,
            status: 'open',
            lastChecked: now,
            updatedAt: now,
          },
        });
    }

    const openIssues = await db.select({
      id: seoIssues.id,
      entityId: seoIssues.entityId,
      issueType: seoIssues.issueType,
      url: seoIssues.url,
    }).from(seoIssues)
      .where(and(eq(seoIssues.tenantId, tenantId), eq(seoIssues.status, 'open')));

    const activeKeys = new Set(
      issues.map((issue) => `${issue.issueType}:${issue.entityId || issue.url}`)
    );

    for (const issue of openIssues) {
      const key = `${issue.issueType}:${issue.entityId || issue.url}`;
      if (!activeKeys.has(key)) {
        await db
          .update(seoIssues)
          .set({ status: 'resolved', resolvedAt: now, updatedAt: now })
          .where(eq(seoIssues.id, issue.id));
      }
    }

    res.json({
      status: issues.length === 0 ? 'healthy' : 'issues_found',
      totalPosts: posts.length,
      issues,
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('SEO health check error:', error);
    res.status(500).json({ error: 'Failed to run SEO health check' });
  }
});

router.get('/api/seo/issues', requireAuth, async (req, res) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const rows = await db.select().from(seoIssues)
      .where(eq(seoIssues.tenantId, tenantId))
      .orderBy(seoIssues.status, seoIssues.updatedAt);
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch SEO issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.patch('/api/seo/issues/:id/resolve', requireAuth, async (req, res) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const issueId = req.params.id;
    const [issue] = await db.select().from(seoIssues)
      .where(and(eq(seoIssues.id, issueId), eq(seoIssues.tenantId, tenantId)));
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    await db.update(seoIssues)
      .set({ status: 'resolved', resolvedAt: new Date(), updatedAt: new Date() })
      .where(eq(seoIssues.id, issueId));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to resolve SEO issue:', error);
    res.status(500).json({ error: 'Failed to resolve issue' });
  }
});

export default router;
