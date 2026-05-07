const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    include: {
      translations: true
    },
    take: 3
  });
  
  for (const place of places) {
    console.log(`Place: ${place.name}`);
    const es = place.translations.find(t => t.language_code === 'es');
    const en = place.translations.find(t => t.language_code === 'en');
    console.log(`- ES: ${es ? es.description.substring(0, 50) + '...' : 'none'}`);
    console.log(`- EN: ${en ? en.description.substring(0, 50) + '...' : 'none'}`);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
