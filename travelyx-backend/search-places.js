const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    where: { name: { contains: 'Casa del Pastel' } },
    select: { id: true, name: true, owner_id: true }
  });
  console.log(JSON.stringify(places, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
