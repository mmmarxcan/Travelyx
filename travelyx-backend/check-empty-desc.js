const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    include: {
      translations: true
    }
  });
  
  const completelyMissing = [];
  
  for (const place of places) {
    if (place.translations.length === 0 && !place.description) {
      completelyMissing.push({
        id: place.id,
        name: place.name
      });
    }
  }
  
  console.log("Completely missing any description:", completelyMissing.length);
  await prisma.$disconnect();
}

main().catch(console.error);
