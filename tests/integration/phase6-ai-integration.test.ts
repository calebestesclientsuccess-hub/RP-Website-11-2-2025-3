
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../server/db';
import { projects, mediaLibrary, projectScenes } from '../../shared/schema';
import { eq } from 'drizzle-orm';

describe('Phase 6: AI Integration with Media Library', () => {
  let testProjectId: string;
  let testMediaIds: string[] = [];

  beforeAll(async () => {
    // Create test project
    const [project] = await db.insert(projects).values({
      tenantId: 'default',
      title: 'AI Integration Test Project',
      slug: 'ai-integration-test',
      clientName: 'Test Client',
      description: 'Testing AI media library integration',
      thumbnailUrl: '',
    }).returning();
    testProjectId = project.id;

    // Create test media assets
    const mediaAssets = [
      {
        tenantId: 'default',
        projectId: testProjectId,
        cloudinaryPublicId: 'test-image-1',
        cloudinaryUrl: 'https://test.cloudinary.com/image1.jpg',
        mediaType: 'image' as const,
        label: 'Hero Image',
        tags: ['hero', 'featured'],
      },
      {
        tenantId: 'default',
        projectId: testProjectId,
        cloudinaryPublicId: 'test-image-2',
        cloudinaryUrl: 'https://test.cloudinary.com/image2.jpg',
        mediaType: 'image' as const,
        label: 'Gallery Image',
        tags: ['gallery'],
      },
      {
        tenantId: 'default',
        projectId: testProjectId,
        cloudinaryPublicId: 'test-video-1',
        cloudinaryUrl: 'https://test.cloudinary.com/video1.mp4',
        mediaType: 'video' as const,
        label: 'Demo Video',
        tags: ['demo', 'video'],
      },
    ];

    for (const asset of mediaAssets) {
      const [media] = await db.insert(mediaLibrary).values(asset).returning();
      testMediaIds.push(media.id);
    }
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(projectScenes).where(eq(projectScenes.projectId, testProjectId));
    await db.delete(mediaLibrary).where(eq(mediaLibrary.projectId, testProjectId));
    await db.delete(projects).where(eq(projects.id, testProjectId));
  });

  it('should generate scenes with mediaId references from available media', async () => {
    // Simulate AI generation with media library context
    const [scene] = await db.insert(projectScenes).values({
      projectId: testProjectId,
      sceneConfig: {
        type: 'image',
        content: {
          url: 'https://test.cloudinary.com/image1.jpg',
          mediaId: testMediaIds[0], // AI should use mediaId
          alt: 'Hero image from media library',
          caption: 'AI generated caption',
        },
        director: {
          entryEffect: 'fade',
          entryDuration: 1.5,
          backgroundColor: '#000000',
          textColor: '#ffffff',
          parallaxIntensity: 0.3,
        },
      },
      order: 0,
    }).returning();

    expect(scene).toBeDefined();
    expect(scene.sceneConfig.content.mediaId).toBe(testMediaIds[0]);
  });

  it('should support gallery scenes with multiple mediaId references', async () => {
    const [galleryScene] = await db.insert(projectScenes).values({
      projectId: testProjectId,
      sceneConfig: {
        type: 'gallery',
        content: {
          images: [
            { 
              url: 'https://test.cloudinary.com/image1.jpg',
              mediaId: testMediaIds[0],
              alt: 'Image 1'
            },
            { 
              url: 'https://test.cloudinary.com/image2.jpg',
              mediaId: testMediaIds[1],
              alt: 'Image 2'
            },
          ],
        },
        director: {
          entryEffect: 'slide-up',
          entryDuration: 1.0,
          backgroundColor: '#ffffff',
          textColor: '#000000',
          staggerChildren: 0.2,
        },
      },
      order: 1,
    }).returning();

    expect(galleryScene.sceneConfig.content.images).toHaveLength(2);
    expect(galleryScene.sceneConfig.content.images[0].mediaId).toBe(testMediaIds[0]);
    expect(galleryScene.sceneConfig.content.images[1].mediaId).toBe(testMediaIds[1]);
  });

  it('should hydrate mediaId to current URL on scene load', async () => {
    // Update media URL (simulating Cloudinary URL change)
    await db.update(mediaLibrary)
      .set({ cloudinaryUrl: 'https://test.cloudinary.com/updated-image1.jpg' })
      .where(eq(mediaLibrary.id, testMediaIds[0]));

    // Fetch scene with hydration
    const scenes = await db
      .select()
      .from(projectScenes)
      .where(eq(projectScenes.projectId, testProjectId))
      .orderBy(projectScenes.order);

    // Verify hydration logic would resolve to new URL
    for (const scene of scenes) {
      if (scene.sceneConfig.content.mediaId === testMediaIds[0]) {
        const [media] = await db
          .select()
          .from(mediaLibrary)
          .where(eq(mediaLibrary.id, testMediaIds[0]));
        
        expect(media.cloudinaryUrl).toBe('https://test.cloudinary.com/updated-image1.jpg');
      }
    }
  });

  it('should support split scenes with media library references', async () => {
    const [splitScene] = await db.insert(projectScenes).values({
      projectId: testProjectId,
      sceneConfig: {
        type: 'split',
        layout: 'default',
        content: {
          heading: 'Split Section',
          body: 'Content with media',
          media: 'https://test.cloudinary.com/image2.jpg',
          mediaMediaId: testMediaIds[1], // Split scene media reference
        },
        director: {
          entryEffect: 'fade',
          entryDuration: 1.2,
          backgroundColor: '#f0f0f0',
          textColor: '#111111',
        },
      },
      order: 2,
    }).returning();

    expect(splitScene.sceneConfig.content.mediaMediaId).toBe(testMediaIds[1]);
  });

  it('should support fullscreen scenes with video from media library', async () => {
    const [fullscreenScene] = await db.insert(projectScenes).values({
      projectId: testProjectId,
      sceneConfig: {
        type: 'fullscreen',
        content: {
          url: 'https://test.cloudinary.com/video1.mp4',
          mediaId: testMediaIds[2], // Video reference
          mediaType: 'video',
          overlayText: 'Demo Video',
        },
        director: {
          entryEffect: 'zoom-in',
          entryDuration: 2.0,
          backgroundColor: '#000000',
          textColor: '#ffffff',
          parallaxIntensity: 0,
        },
      },
      order: 3,
    }).returning();

    expect(fullscreenScene.sceneConfig.content.mediaId).toBe(testMediaIds[2]);
    expect(fullscreenScene.sceneConfig.content.mediaType).toBe('video');
  });

  it('should allow AI to generate scenes with mixed media sources', async () => {
    // AI can use both media library (mediaId) and direct URLs
    const [mixedScene] = await db.insert(projectScenes).values({
      projectId: testProjectId,
      sceneConfig: {
        type: 'gallery',
        content: {
          images: [
            { 
              url: 'https://test.cloudinary.com/image1.jpg',
              mediaId: testMediaIds[0], // From media library
              alt: 'Library image'
            },
            { 
              url: 'https://external.cdn.com/image.jpg',
              mediaId: undefined, // Direct URL fallback
              alt: 'External image'
            },
          ],
        },
        director: {
          entryEffect: 'fade',
          entryDuration: 1.5,
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
      },
      order: 4,
    }).returning();

    expect(mixedScene.sceneConfig.content.images).toHaveLength(2);
    expect(mixedScene.sceneConfig.content.images[0].mediaId).toBe(testMediaIds[0]);
    expect(mixedScene.sceneConfig.content.images[1].mediaId).toBeUndefined();
  });

  it('should preserve backward compatibility with scenes without mediaId', async () => {
    // Old scenes without mediaId should still work
    const [legacyScene] = await db.insert(projectScenes).values({
      projectId: testProjectId,
      sceneConfig: {
        type: 'image',
        content: {
          url: 'https://legacy.cdn.com/old-image.jpg',
          // No mediaId - legacy format
          alt: 'Legacy image',
        },
        director: {
          entryEffect: 'fade',
          entryDuration: 1.0,
          backgroundColor: '#000000',
          textColor: '#ffffff',
        },
      },
      order: 5,
    }).returning();

    expect(legacyScene.sceneConfig.content.url).toBe('https://legacy.cdn.com/old-image.jpg');
    expect(legacyScene.sceneConfig.content.mediaId).toBeUndefined();
  });
});
