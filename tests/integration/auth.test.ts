
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../server/db';
import { users, tenants } from '@shared/schema';
import { eq } from 'drizzle-orm';
import supertest from 'supertest';
import express from 'express';
import session from 'express-session';
import { registerRoutes } from '../../server/routes';

describe('Authentication API', () => {
  let app: express.Application;
  let request: supertest.SuperTest<supertest.Test>;
  const testTenantId = 'test-tenant-auth';

  beforeAll(async () => {
    // Create test tenant
    await db.insert(tenants).values({
      id: testTenantId,
      name: 'Test Tenant',
      slug: 'test-tenant',
    });

    // Setup test app
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
    }));
    
    // Mock tenant middleware
    app.use((req, _res, next) => {
      req.tenantId = testTenantId;
      next();
    });

    await registerRoutes(app);
    request = supertest(app);
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(users).where(eq(users.tenantId, testTenantId));
    await db.delete(tenants).where(eq(tenants.id, testTenantId));
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test123!@#',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testuser');
    });

    it('should reject weak passwords', async () => {
      const response = await request
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('security requirements');
    });

    it('should reject duplicate usernames', async () => {
      const response = await request
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'different@example.com',
          password: 'Test123!@#',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Test123!@#',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('should reject invalid credentials', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should implement account lockout after failed attempts', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request
          .post('/api/auth/login')
          .send({
            username: 'lockouttest',
            password: 'wrongpassword',
          });
      }

      // Next attempt should be locked out
      const response = await request
        .post('/api/auth/login')
        .send({
          username: 'lockouttest',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('locked');
    });
  });
});
