import { PrismaClient } from '@prisma/client';
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
    console.log(`✅ Se actualizaron las coordenadas de ${updated.count} lugar(es).`);
  } catch (err) {
    console.error('❌ Error al actualizar:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateCoordinates();
