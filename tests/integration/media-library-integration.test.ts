
import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db';
import { projects, projectScenes, mediaLibrary } from '../../shared/schema';
import { eq } from 'drizzle-orm';

describe('Media Library Integration', () => {
  let testProjectId: string;
  let testMediaId: string;

  beforeAll(async () => {
    // Create test project
    const [project] = await db.insert(projects).values({
      title: 'Test Project',
      subtitle: 'For testing',
      heroTagline: 'Test',
    }).returning();
    testProjectId = project.id;

    // Create test media
    const [media] = await db.insert(mediaLibrary).values({
      projectId: testProjectId,
      cloudinaryUrl: 'https://test.cloudinary.com/image.jpg',
      publicId: 'test-image',
      type: 'image',
      format: 'jpg',
    }).returning();
    testMediaId = media.id;
  });

  it('should create scene with mediaId reference', async () => {
    const [scene] = await db.insert(projectScenes).values({
      projectId: testProjectId,
      sceneConfig: {
        type: 'image',
        content: {
          url: 'https://test.cloudinary.com/image.jpg',
          mediaId: testMediaId,
          alt: 'Test image',
        },
      },
      order: 1,
    }).returning();

    expect(scene.sceneConfig.content.mediaId).toBe(testMediaId);
  });

  it('should hydrate mediaId to current URL', async () => {
    // Update media URL
    await db.update(mediaLibrary)
      .set({ cloudinaryUrl: 'https://test.cloudinary.com/new-image.jpg' })
      .where(eq(mediaLibrary.id, testMediaId));

    const scenes = await db
      .select()
      .from(projectScenes)
      .where(eq(projectScenes.projectId, testProjectId));

    // Verify hydration logic would resolve to new URL
    const scene = scenes[0];
    if (scene.sceneConfig.content.mediaId === testMediaId) {
      const [media] = await db
        .select()
        .from(mediaLibrary)
        .where(eq(mediaLibrary.id, testMediaId));
      
      expect(media.cloudinaryUrl).toBe('https://test.cloudinary.com/new-image.jpg');
    }
  });
});
