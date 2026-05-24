const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://postgres:haruka-yuto1@db.prlkcxbmjnvnokbqoift.supabase.co:5432/postgres?schema=public' }
  }
});

async function main() {
  try {
    console.log('Checking database image sizes...');
    const images = await prisma.placeImage.findMany({
      take: 10,
      select: {
        id: true,
        place_id: true,
        image_url: true
      }
    });

    console.log(`Found ${images.length} images.`);
    for (const img of images) {
      console.log(`Image #${img.id} for Place #${img.place_id}: length = ${img.image_url.length} characters`);
      if (img.image_url.startsWith('data:image')) {
        console.log(`  -> This is a base64 image! Length: ${img.image_url.length}`);
      } else {
        console.log(`  -> URL: ${img.image_url.substring(0, 100)}...`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
