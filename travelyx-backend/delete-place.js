const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteCasaDelPastel() {
  const nameToFind = 'La Casa del Pastel';
  
  console.log(`🔍 Buscando "${nameToFind}"...`);
  
  const place = await prisma.place.findFirst({
    where: { name: { contains: nameToFind } }
  });

  if (!place) {
    console.error(`❌ No se encontró ningún lugar con el nombre "${nameToFind}".`);
    return;
  }

  console.log(`🗑️ Borrando "${place.name}" (ID: ${place.id}) y sus relaciones...`);

  try {
    // Borrar traducciones
    await prisma.placeTranslation.deleteMany({ where: { place_id: place.id } });
    
    // Borrar amenidades
    await prisma.placeAmenity.deleteMany({ where: { place_id: place.id } });
    
    // Borrar imágenes
    await prisma.placeImage.deleteMany({ where: { place_id: place.id } });
    
    // Borrar platillos (aunque tiene cascade, lo hacemos explícito para seguridad)
    await prisma.dish.deleteMany({ where: { place_id: place.id } });

    // Finalmente borrar el lugar
    await prisma.place.delete({ where: { id: place.id } });

    console.log(`✅ ¡Lugar eliminado con éxito!`);
  } catch (error) {
    console.error(`❌ Error al eliminar:`, error);
  }

  await prisma.$disconnect();
}

deleteCasaDelPastel().catch(console.error);
