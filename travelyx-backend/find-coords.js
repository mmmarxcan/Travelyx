const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    where: {
      OR: [
        { name: { contains: 'Bacalauh', mode: 'insensitive' } },
        { name: { contains: 'Saint Bonnet', mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, lat: true, lng: true }
  });

  console.log("Places found:");
  console.log(places);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
