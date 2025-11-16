
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../server/db';
import { users, tenants, testimonials, jobPostings } from '@shared/schema';
import { eq } from 'drizzle-orm';
import supertest from 'supertest';
import express from 'express';
import session from 'express-session';
import { registerRoutes } from '../../server/routes';
import bcrypt from 'bcryptjs';

describe('Admin CRUD Operations', () => {
  let app: express.Application;
  let request: supertest.SuperTest<supertest.Test>;
  let authCookie: string;
  const testTenantId = 'test-tenant-admin';
  let testUserId: string;

  beforeAll(async () => {
    // Create test tenant
    await db.insert(tenants).values({
      id: testTenantId,
      name: 'Test Tenant',
      slug: 'test-tenant',
    });

    // Create test admin user
    const hashedPassword = await bcrypt.hash('TestPass123!', 10);
    const [user] = await db.insert(users).values({
      tenantId: testTenantId,
      username: 'testadmin',
      email: 'admin@test.com',
      password: hashedPassword,
    }).returning();
    testUserId = user.id;

    // Setup test app
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
    }));
    
    app.use((req, _res, next) => {
      req.tenantId = testTenantId;
      next();
    });

    await registerRoutes(app);
    request = supertest.agent(app);

    // Login to get auth cookie
    const loginResponse = await request
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'TestPass123!' });
    
    authCookie = loginResponse.headers['set-cookie'];
  });

  afterAll(async () => {
    await db.delete(testimonials).where(eq(testimonials.tenantId, testTenantId));
    await db.delete(jobPostings).where(eq(jobPostings.tenantId, testTenantId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(tenants).where(eq(tenants.id, testTenantId));
  });

  describe('Testimonials CRUD', () => {
    it('should create testimonial', async () => {
      const response = await request
        .post('/api/testimonials')
        .set('Cookie', authCookie)
        .send({
          name: 'John Doe',
          title: 'CEO',
          company: 'Test Corp',
          quote: 'Great service!',
          featured: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('John Doe');
    });

    it('should update testimonial', async () => {
      const [testimonial] = await db.insert(testimonials).values({
        tenantId: testTenantId,
        name: 'Jane Smith',
        quote: 'Original quote',
      }).returning();

      const response = await request
        .patch(`/api/testimonials/${testimonial.id}`)
        .set('Cookie', authCookie)
        .send({ quote: 'Updated quote' });

      expect(response.status).toBe(200);
      expect(response.body.quote).toBe('Updated quote');
    });

    it('should delete testimonial', async () => {
      const [testimonial] = await db.insert(testimonials).values({
        tenantId: testTenantId,
        name: 'To Delete',
        quote: 'Will be deleted',
      }).returning();

      const response = await request
        .delete(`/api/testimonials/${testimonial.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(204);
    });

    it('should prevent unauthorized access', async () => {
      const response = await request
        .post('/api/testimonials')
        .send({
          name: 'Unauthorized',
          quote: 'Should fail',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Job Postings CRUD', () => {
    it('should create job posting', async () => {
      const response = await request
        .post('/api/job-postings')
        .set('Cookie', authCookie)
        .send({
          title: 'Software Engineer',
          department: 'Engineering',
          location: 'Remote',
          description: 'We are hiring',
          requirements: ['3+ years experience'],
          active: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Software Engineer');
    });

    it('should update job posting', async () => {
      const [job] = await db.insert(jobPostings).values({
        tenantId: testTenantId,
        title: 'Original Title',
        description: 'Original description',
        active: true,
      }).returning();

      const response = await request
        .patch(`/api/job-postings/${job.id}`)
        .set('Cookie', authCookie)
        .send({ active: false });

      expect(response.status).toBe(200);
      expect(response.body.active).toBe(false);
    });

    it('should enforce tenant isolation', async () => {
      const [otherTenant] = await db.insert(tenants).values({
        id: 'other-tenant',
        name: 'Other Tenant',
        slug: 'other',
      }).returning();

      const [otherJob] = await db.insert(jobPostings).values({
        tenantId: 'other-tenant',
        title: 'Other Job',
        description: 'Should not be accessible',
        active: true,
      }).returning();

      const response = await request
        .get(`/api/job-postings/${otherJob.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(404);

      // Cleanup
      await db.delete(jobPostings).where(eq(jobPostings.id, otherJob.id));
      await db.delete(tenants).where(eq(tenants.id, 'other-tenant'));
    });
  });
});
