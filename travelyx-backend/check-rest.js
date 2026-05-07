const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const restaurants = await prisma.place.findMany({
    where: { category: { slug: 'restaurant' } },
    select: { name: true, custom_prices: true, dishes: true }
  });
  
  for(let r of restaurants) {
    if (r.custom_prices) {
        console.log(`Restaurant: ${r.name} uses custom_prices`);
        console.log(r.custom_prices);
    }
    if (r.dishes && r.dishes.length > 0) {
        console.log(`Restaurant: ${r.name} uses dishes`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
