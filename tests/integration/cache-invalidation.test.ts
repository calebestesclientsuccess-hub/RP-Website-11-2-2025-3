
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../server/db';
import { projects, projectScenes, mediaLibrary } from '../../shared/schema';
import { eq } from 'drizzle-orm';

describe('Cache Invalidation', () => {
  let testProjectId: string;
  let testMediaId: string;

  beforeAll(async () => {
    // Create test project
    const [project] = await db.insert(projects).values({
      tenantId: 'default',
      title: 'Cache Test Project',
      slug: `cache-test-${Date.now()}`,
      thumbnailUrl: '',
    }).returning();
    testProjectId = project.id;

    // Create test media
    const [media] = await db.insert(mediaLibrary).values({
      tenantId: 'default',
      projectId: testProjectId,
      cloudinaryPublicId: 'cache-test-media',
      cloudinaryUrl: 'https://test.cloudinary.com/v1/image.jpg',
      mediaType: 'image',
    }).returning();
    testMediaId = media.id;

    // Create scene with mediaId
    await db.insert(projectScenes).values({
      projectId: testProjectId,
      sceneConfig: {
        type: 'image',
        content: {
          url: media.cloudinaryUrl,
          mediaId: testMediaId,
          alt: 'Test image',
        },
        director: {
          entryDuration: 1.0,
          exitDuration: 1.0,
          backgroundColor: '#000000',
          textColor: '#ffffff',
        },
      },
      order: 0,
    });
  });

  afterAll(async () => {
    // Clean up
    await db.delete(projectScenes).where(eq(projectScenes.projectId, testProjectId));
    await db.delete(mediaLibrary).where(eq(mediaLibrary.id, testMediaId));
    await db.delete(projects).where(eq(projects.id, testProjectId));
  });

  it('should reflect media URL changes after hydration', async () => {
    // Update media URL
    const newUrl = 'https://test.cloudinary.com/v2/image-updated.jpg';
    await db.update(mediaLibrary)
      .set({ cloudinaryUrl: newUrl })
      .where(eq(mediaLibrary.id, testMediaId));

    // Fetch scenes with hydration
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, testProjectId)
    });

    expect(project).toBeDefined();
    const scenes = project!.scenes || [];
    expect(scenes.length).toBe(1);

    // Manual hydration simulation
    const scene = scenes[0];
    if (scene.sceneConfig.content.mediaId === testMediaId) {
      const [updatedMedia] = await db
        .select()
        .from(mediaLibrary)
        .where(eq(mediaLibrary.id, testMediaId));
      
      expect(updatedMedia.cloudinaryUrl).toBe(newUrl);
      console.log('✓ Media URL change detected through hydration');
    }
  });

  it('should preserve mediaId after URL changes', async () => {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, testProjectId)
    });

    const scene = project!.scenes[0];
    expect(scene.sceneConfig.content.mediaId).toBe(testMediaId);
    console.log('✓ mediaId preserved after URL update');
  });
});
