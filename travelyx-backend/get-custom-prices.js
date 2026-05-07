const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const place = await prisma.place.findUnique({
    where: { id: 122 }
  });
  console.log(place.custom_prices);
  await prisma.$disconnect();
}

main().catch(console.error);
