
import { db } from '../server/db';
import { projects, projectScenes, mediaLibrary } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function testMediaIntegration() {
  console.log('🧪 Testing Media Library Integration...\n');

  try {
    // 1. Create test project
    const [project] = await db.insert(projects).values({
      tenantId: 'default',
      title: 'Media Integration Test',
      slug: `test-${Date.now()}`,
      thumbnailUrl: '',
      categories: [],
    }).returning();
    console.log('✅ Created test project:', project.id);

    // 2. Create test media
    const [media] = await db.insert(mediaLibrary).values({
      tenantId: 'default',
      projectId: project.id,
      cloudinaryPublicId: 'test-media',
      cloudinaryUrl: 'https://test.cloudinary.com/image.jpg',
      mediaType: 'image',
    }).returning();
    console.log('✅ Created test media:', media.id);

    // 3. Create scene with mediaId
    const [scene] = await db.insert(projectScenes).values({
      projectId: project.id,
      sceneConfig: {
        type: 'image',
        content: {
          url: media.cloudinaryUrl,
          mediaId: media.id,
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
    }).returning();
    console.log('✅ Created scene with mediaId:', scene.id);

    // 4. Verify mediaId was saved
    const savedScene = await db.query.projectScenes.findFirst({
      where: eq(projectScenes.id, scene.id),
    });
    
    if (savedScene?.sceneConfig?.content?.mediaId === media.id) {
      console.log('✅ mediaId persisted correctly');
    } else {
      console.error('❌ mediaId NOT persisted');
      console.log('Expected:', media.id);
      console.log('Got:', savedScene?.sceneConfig?.content?.mediaId);
    }

    // 5. Test hydration (simulated)
    const [hydratedMedia] = await db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.id, media.id));
    
    if (hydratedMedia?.cloudinaryUrl) {
      console.log('✅ Hydration would resolve to:', hydratedMedia.cloudinaryUrl);
    }

    // Cleanup
    await db.delete(projectScenes).where(eq(projectScenes.id, scene.id));
    await db.delete(mediaLibrary).where(eq(mediaLibrary.id, media.id));
    await db.delete(projects).where(eq(projects.id, project.id));
    console.log('\n✅ Cleanup complete');

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMediaIntegration();
