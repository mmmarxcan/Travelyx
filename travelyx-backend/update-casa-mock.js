const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const place = await prisma.place.findUnique({
    where: { id: 122 }
  });
  if (place.custom_prices) {
    const parsed = JSON.parse(place.custom_prices);
    parsed[0].label_en = "Strawberry Pie";
    
    await prisma.place.update({
      where: { id: 122 },
      data: {
        custom_prices: JSON.stringify(parsed)
      }
    });
    console.log("Updated custom_prices with label_en for Casa del Pastel");
  }
  await prisma.$disconnect();
}

main().catch(console.error);
