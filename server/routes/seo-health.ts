
import { Router } from 'express';
import { db } from '../db';
import { blogPosts, seoIssues, users } from '../../shared/schema';
import { and, eq, desc } from 'drizzle-orm';
import { DEFAULT_TENANT_ID, requireUserContext } from '../middleware/tenant';
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
      const issueWhere = issue.entityId
        ? and(
            eq(seoIssues.tenantId, tenantId),
            eq(seoIssues.issueType, issue.issueType),
            eq(seoIssues.entityId, issue.entityId)
          )
        : and(
            eq(seoIssues.tenantId, tenantId),
            eq(seoIssues.issueType, issue.issueType),
            eq(seoIssues.url, issue.url)
          );

      const [existingIssue] = await db
        .select({
          id: seoIssues.id,
          status: seoIssues.status,
        })
        .from(seoIssues)
        .where(issueWhere)
        .limit(1);

      if (existingIssue?.status === 'ignored') {
        await db
          .update(seoIssues)
          .set({ lastChecked: now, updatedAt: now })
          .where(eq(seoIssues.id, existingIssue.id));
        continue;
      }

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
          resolvedBy: null,
          resolvedAt: null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: seoIssues.uniqueIssue,
          set: {
            url: issue.url,
            details: issue.details,
            severity: issue.severity,
            status: 'open',
             resolvedBy: null,
             resolvedAt: null,
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
    const rows = await db.select({
      id: seoIssues.id,
      tenantId: seoIssues.tenantId,
      url: seoIssues.url,
      entityType: seoIssues.entityType,
      entityId: seoIssues.entityId,
      issueType: seoIssues.issueType,
      severity: seoIssues.severity,
      status: seoIssues.status,
      details: seoIssues.details,
      lastChecked: seoIssues.lastChecked,
      resolvedAt: seoIssues.resolvedAt,
      resolvedBy: seoIssues.resolvedBy,
      createdAt: seoIssues.createdAt,
      updatedAt: seoIssues.updatedAt,
      resolvedByName: users.username,
    }).from(seoIssues)
      .leftJoin(users, eq(seoIssues.resolvedBy, users.id))
      .where(eq(seoIssues.tenantId, tenantId))
      .orderBy(seoIssues.status, desc(seoIssues.updatedAt));
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
    const resolvedBy = requireUserContext(req, res);
    if (!resolvedBy) {
      return;
    }
    const timestamp = new Date();
    await db.update(seoIssues)
      .set({ status: 'resolved', resolvedAt: timestamp, resolvedBy, updatedAt: timestamp })
      .where(eq(seoIssues.id, issueId));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to resolve SEO issue:', error);
    res.status(500).json({ error: 'Failed to resolve issue' });
  }
});

router.patch('/api/seo/issues/:id/ignore', requireAuth, async (req, res) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const issueId = req.params.id;
    const [issue] = await db.select().from(seoIssues)
      .where(and(eq(seoIssues.id, issueId), eq(seoIssues.tenantId, tenantId)));
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    const actorId = requireUserContext(req, res);
    if (!actorId) {
      return;
    }
    const timestamp = new Date();
    await db.update(seoIssues)
      .set({ status: 'ignored', resolvedAt: timestamp, resolvedBy: actorId, updatedAt: timestamp })
      .where(eq(seoIssues.id, issueId));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to ignore SEO issue:', error);
    res.status(500).json({ error: 'Failed to ignore issue' });
  }
});

export default router;
