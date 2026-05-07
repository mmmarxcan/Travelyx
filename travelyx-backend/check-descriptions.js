const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    include: {
      translations: true
    }
  });
  
  const missingEnglish = [];
  
  for (const place of places) {
    const hasEnglish = place.translations.some(t => t.language_code === 'en');
    const esTranslation = place.translations.find(t => t.language_code === 'es');
    
    // Some older records might store description directly on the place table, though the schema might have moved it
    const esDesc = esTranslation ? esTranslation.description : place.description;
    
    if (!hasEnglish && esDesc) {
      missingEnglish.push({
        id: place.id,
        name: place.name,
        esDescription: esDesc
      });
    }
  }
  
  console.log(JSON.stringify(missingEnglish, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
