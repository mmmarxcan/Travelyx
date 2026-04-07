const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCoordinates() {
  try {
    const updated = await prisma.place.updateMany({
      where: { name: { contains: 'Casa del Pastel' } },
      data: {
        lat: 21.2869,
        lng: -89.6585
      }
    });
    console.log(`✅ Coordenadas actualizadas: ${updated.count} registros.`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateCoordinates();
