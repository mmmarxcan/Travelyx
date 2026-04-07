require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCategories() {
  const cats = [
    { id: 1, slug: 'hotel' },
    { id: 2, slug: 'restaurant' },
    { id: 3, slug: 'tourist_spot' },
  ];

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
  }
  console.log('✅ Categories seeded:', cats.map(c => c.slug).join(', '));
  await prisma.$disconnect();
}

seedCategories().catch(e => { console.error(e); process.exit(1); });
