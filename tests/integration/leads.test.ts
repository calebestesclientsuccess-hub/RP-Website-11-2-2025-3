
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../server/db';
import { leads, tenants } from '@shared/schema';
import { eq } from 'drizzle-orm';
import supertest from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

describe('Leads API', () => {
  let app: express.Application;
  let request: supertest.SuperTest<supertest.Test>;
  const testTenantId = 'test-tenant-leads';

  beforeAll(async () => {
    await db.insert(tenants).values({
      id: testTenantId,
      name: 'Test Tenant',
      slug: 'test-tenant',
    });

    app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      req.tenantId = testTenantId;
      next();
    });

    await registerRoutes(app);
    request = supertest(app);
  });

  afterAll(async () => {
    await db.delete(leads).where(eq(leads.tenantId, testTenantId));
    await db.delete(tenants).where(eq(tenants.id, testTenantId));
  });

  describe('POST /api/leads/capture', () => {
    it('should create a lead with valid data', async () => {
      const response = await request
        .post('/api/leads/capture')
        .send({
          email: 'lead@example.com',
          name: 'Test Lead',
          company: 'Test Company',
          source: 'test',
          pageUrl: '/test',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('id');
    });

    it('should sanitize input to prevent XSS', async () => {
      const response = await request
        .post('/api/leads/capture')
        .send({
          email: 'xss@example.com',
          name: '<script>alert("xss")</script>',
          company: 'Test Company',
          source: 'test',
          pageUrl: '/test',
        });

      expect(response.status).toBe(201);
      
      const [lead] = await db.select()
        .from(leads)
        .where(eq(leads.email, 'xss@example.com'));
      
      expect(lead.name).not.toContain('<script>');
    });

    it('should validate email format', async () => {
      const response = await request
        .post('/api/leads/capture')
        .send({
          email: 'invalid-email',
          name: 'Test Lead',
          company: 'Test Company',
          source: 'test',
          pageUrl: '/test',
        });

      expect(response.status).toBe(400);
    });

    it('should respect rate limiting', async () => {
      // Make multiple requests rapidly
      const requests = Array(4).fill(null).map((_, i) =>
        request
          .post('/api/leads/capture')
          .send({
            email: `ratelimit${i}@example.com`,
            source: 'test',
            pageUrl: '/test',
          })
      );

      const responses = await Promise.all(requests);
      
      // Check if any response was rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});
