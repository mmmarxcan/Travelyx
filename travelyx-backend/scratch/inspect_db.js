
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'places'
    `;
    console.log('Columns in "places" table:');
    console.table(columns);
  } catch (error) {
    console.error('Error fetching columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
