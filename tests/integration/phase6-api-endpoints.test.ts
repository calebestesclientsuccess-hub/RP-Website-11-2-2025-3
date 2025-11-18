
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server/app';
import { getTestDb } from '../helpers/db';
const db = getTestDb();
import { projects, mediaLibrary } from '../../shared/schema';

describe('Phase 6: API Endpoints for AI Media Integration', () => {
  let authCookie: string;
  let testProjectId: string;

  beforeAll(async () => {
    // Login to get auth cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'your-password' });
    
    authCookie = loginRes.headers['set-cookie'];

    // Create test project
    const [project] = await db.insert(projects).values({
      tenantId: 'default',
      title: 'API Test Project',
      slug: 'api-test-project',
      clientName: 'Test',
      description: 'Testing API endpoints',
      thumbnailUrl: '',
    }).returning();
    testProjectId = project.id;
  });

  it('should fetch media assets for a specific project', async () => {
    const response = await request(app)
      .get(`/api/projects/${testProjectId}/media`)
      .set('Cookie', authCookie)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create scene with mediaId via API', async () => {
    // First create a media asset
    const uploadRes = await request(app)
      .post('/api/media-library/upload')
      .set('Cookie', authCookie)
      .attach('file', Buffer.from('fake-image'), 'test.jpg')
      .field('label', 'Test Image')
      .field('project_id', testProjectId);

    const mediaId = uploadRes.body.id;

    // Create scene with mediaId
    const sceneRes = await request(app)
      .post(`/api/projects/${testProjectId}/scenes`)
      .set('Cookie', authCookie)
      .send({
        sceneConfig: {
          type: 'image',
          content: {
            url: uploadRes.body.cloudinaryUrl,
            mediaId: mediaId,
            alt: 'Test image',
          },
          director: {
            entryEffect: 'fade',
            entryDuration: 1.5,
            backgroundColor: '#000000',
            textColor: '#ffffff',
          },
        },
        order: 0,
      })
      .expect(201);

    expect(sceneRes.body.sceneConfig.content.mediaId).toBe(mediaId);
  });

  it('should hydrate scenes with ?hydrate=true query param', async () => {
    const response = await request(app)
      .get(`/api/projects/${testProjectId}/scenes?hydrate=true`)
      .expect(200);

    // Verify scenes have current media URLs
    expect(Array.isArray(response.body)).toBe(true);
    
    for (const scene of response.body) {
      if (scene.sceneConfig.content?.mediaId) {
        expect(scene.sceneConfig.content.url).toBeTruthy();
      }
    }
  });

  it('should validate mediaId exists when creating scene', async () => {
    const response = await request(app)
      .post(`/api/projects/${testProjectId}/scenes`)
      .set('Cookie', authCookie)
      .send({
        sceneConfig: {
          type: 'image',
          content: {
            url: 'https://test.com/image.jpg',
            mediaId: 'invalid-media-id-xyz',
            alt: 'Invalid reference',
          },
          director: {
            entryEffect: 'fade',
            entryDuration: 1.0,
            backgroundColor: '#000000',
            textColor: '#ffffff',
          },
        },
        order: 0,
      })
      .expect(400);

    expect(response.body.error).toContain('Invalid media reference');
  });

  it('should auto-link media to project when used in scene', async () => {
    // Create media without project link
    const [media] = await db.insert(mediaLibrary).values({
      tenantId: 'default',
      projectId: null, // No project initially
      cloudinaryPublicId: 'unlinked-media',
      cloudinaryUrl: 'https://test.com/unlinked.jpg',
      mediaType: 'image',
    }).returning();

    // Use in scene - should auto-link
    await request(app)
      .post(`/api/projects/${testProjectId}/scenes`)
      .set('Cookie', authCookie)
      .send({
        sceneConfig: {
          type: 'image',
          content: {
            url: media.cloudinaryUrl,
            mediaId: media.id,
            alt: 'Auto-linked',
          },
          director: {
            entryEffect: 'fade',
            entryDuration: 1.0,
            backgroundColor: '#000000',
            textColor: '#ffffff',
          },
        },
        order: 0,
      })
      .expect(201);

    // Verify media is now linked to project
    const updatedMedia = await db.query.mediaLibrary.findFirst({
      where: (fields, { eq }) => eq(fields.id, media.id),
    });

    expect(updatedMedia?.projectId).toBe(testProjectId);
  });
});
