const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOwners() {
  console.log('--- Resumen de Lugares por Propietario ---');
  const counts = await prisma.place.groupBy({
    by: ['owner_id'],
    _count: { id: true }
  });

  for (const c of counts) {
    const user = await prisma.user.findUnique({ where: { id: c.owner_id } });
    console.log(`Owner ID ${c.owner_id} (${user?.email || 'N/A'}): ${c._count.id} lugares`);
  }

  const casa = await prisma.place.findFirst({
    where: { name: { contains: 'Casa del Pastel' } }
  });
  
  if (casa) {
    const owner = await prisma.user.findUnique({ where: { id: casa.owner_id } });
    console.log(`\n🔍 La Casa del Pastel está asignada a: ${owner?.email} (ID: ${casa.owner_id})`);
  } else {
    console.log('\n❌ No se encontró La Casa del Pastel.');
  }

  await prisma.$disconnect();
}

checkOwners().catch(console.error);
