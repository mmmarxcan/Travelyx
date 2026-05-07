const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const place = await prisma.place.findUnique({
    where: { id: 122 }
  });
  if (place.custom_prices) {
    const parsed = JSON.parse(place.custom_prices);
    const cleaned = parsed.map(p => ({
      label: p.label,
      label_en: p.label_en,
      price: p.price
    }));
    console.log(JSON.stringify(cleaned, null, 2));
  }
  await prisma.$disconnect();
}

main().catch(console.error);
