require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  const cats = await prisma.category.findMany();
  console.log('--- CATEGORIES ---');
  cats.forEach(c => console.log(`${c.id}: ${c.slug}`));
  
  const amenitiesCount = await prisma.amenity.count();
  console.log('--- AMENITIES ---');
  console.log(`Total Amenities: ${amenitiesCount}`);
  
  const relCount = await prisma.categoryAmenity.count();
  console.log(`Total Category-Amenity Relations: ${relCount}`);

  await prisma.$disconnect();
}

checkCategories();
