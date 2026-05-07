const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.place.findFirst({ where: { name: { contains: 'TOMMY' } } });
  if (p) {
    console.log(`ID for Tommy's: ${p.id}`);
    
    // Update Restaurant
    const restPrices = [
      {
        label: "Camarones al mojo de ajo",
        label_en: "Shrimp in Garlic Sauce",
        price: 290,
        image_url: ""
      }
    ];
    await prisma.place.update({
      where: { id: p.id },
      data: { custom_prices: JSON.stringify(restPrices) }
    });
    console.log("Updated Tommy's Restaurant");
  }

  // Update Hotel (ID 84 was from previous successful run of find-test-places.js)
  const hotelPrices = [
    {
      label: "Habitación estándar, varias camas, refrigerador y microondas, planta baja",
      label_en: "Standard Room, multiple beds, fridge and microwave, ground floor",
      price: 1553
    }
  ];
  await prisma.place.update({
    where: { id: 84 },
    data: { custom_prices: JSON.stringify(hotelPrices) }
  });
  console.log("Updated Hotel Domani");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
