const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    where: { custom_prices: { not: null } }
  });
  
  const allLabels = [];
  for (const p of places) {
    if (p.custom_prices) {
      try {
        const prices = JSON.parse(p.custom_prices);
        prices.forEach(price => {
          if (price.label) {
            allLabels.push({ id: p.id, placeName: p.name, label: price.label, label_en: price.label_en });
          }
        });
      } catch (e) {}
    }
  }
  console.log(JSON.stringify(allLabels, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
