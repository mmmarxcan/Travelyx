const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rest = await prisma.place.findFirst({
    where: { category: { slug: 'restaurant' } }
  });
  const hotel = await prisma.place.findFirst({
    where: { category: { slug: 'hotel' } }
  });
  
  console.log(JSON.stringify({
    rest: rest ? { id: rest.id, name: rest.name, prices: rest.custom_prices } : null,
    hotel: hotel ? { id: hotel.id, name: hotel.name, prices: hotel.custom_prices } : null
  }, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
