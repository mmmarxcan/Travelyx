const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const place = await prisma.place.findFirst({
    where: { 
      category: { slug: 'restaurant' },
      custom_prices: { not: null, not: '' }
    },
    select: { name: true, custom_prices: true }
  });
  
  if (place) {
    console.log(`Restaurant: ${place.name}`);
    console.log(place.custom_prices.substring(0, 1000));
  } else {
    console.log("No restaurant with custom_prices found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
