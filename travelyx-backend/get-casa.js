const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const casa = await prisma.place.findFirst({
    where: { name: { contains: 'Casa del Pastel' } },
    include: {
      category: true,
      translations: true,
      images: true
    }
  });
  fs.writeFileSync('casa_details.json', JSON.stringify(casa, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
