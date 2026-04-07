const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const translations = await prisma.placeTranslation.findMany({
    include: { place: true }
  });
  
  console.log('--- Current Translations ---');
  const places = {};
  translations.forEach(t => {
    if (!places[t.place_id]) places[t.place_id] = { id: t.place_id, name: t.place.name, langs: [] };
    places[t.place_id].langs.push(`${t.language_code}: ${t.description.substring(0, 30)}...`);
  });
  
  Object.values(places).forEach(p => {
    console.log(`Place #${p.id} (${p.name}): [${p.langs.join(', ')}]`);
  });

  await prisma.$disconnect();
}

check();
