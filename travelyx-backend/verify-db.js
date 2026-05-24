const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Database Verification ---');
    
    const usersCount = await prisma.user.count();
    console.log(`Users count: ${usersCount}`);
    
    const placesCount = await prisma.place.count();
    console.log(`Places count: ${placesCount}`);
    
    if (placesCount > 0) {
      const placesByStatus = await prisma.place.groupBy({
        by: ['status'],
        _count: true
      });
      console.log('Places by status:');
      console.log(JSON.stringify(placesByStatus, null, 2));
      
      const samplePlaces = await prisma.place.findMany({
        take: 3,
        select: { id: true, name: true, status: true, category_id: true }
      });
      console.log('Sample Places:');
      console.log(JSON.stringify(samplePlaces, null, 2));
    } else {
      console.log('⚠️ No places found in database.');
    }

  } catch (error) {
    console.error('❌ Database query failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
