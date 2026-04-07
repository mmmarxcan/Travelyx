const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const places = await prisma.place.findMany({
      select: { id: true, name: true, status: true, is_active: true }
    });
    console.log('--- ESTADO DE LUGARES EN DB ---');
    console.table(places);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
