const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkScappata() {
  const scappata = await prisma.place.findFirst({
    where: { name: { contains: 'Scappata', mode: 'insensitive' } },
    include: { category: true }
  });
  console.log(JSON.stringify(scappata, null, 2));
  await prisma.$disconnect();
}

checkScappata();
