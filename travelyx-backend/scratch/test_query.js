
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

async function main() {
  console.log('--- Starting query test ---');
  try {
    const places = await prisma.place.findMany({
      include: {
        category: true,
      },
    });
    console.log(`Success! Found ${places.length} places.`);
  } catch (error) {
    console.error('--- ERROR DETECTED ---');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
