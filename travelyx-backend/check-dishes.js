const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const placeWithDishes = await prisma.dish.findFirst();
  console.log("Dish in table:", placeWithDishes);

  const placeWithCustomPrices = await prisma.place.findFirst({
    where: { custom_prices: { not: null } },
    select: { id: true, name: true, custom_prices: true }
  });
  console.log("Place with custom_prices:", placeWithCustomPrices);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
