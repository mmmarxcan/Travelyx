require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function populateRealDemo() {
  const email = 'algo@gmail.com';
  console.log(`🔍 Actualizando cuenta ${email} con lugares reales del Malecón...`);

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    user = await prisma.user.create({
      data: {
        email,
        full_name: 'Propietario Real',
        password_hash: hashedPassword,
        role: 'OWNER',
        must_change_password: false
      }
    });
  }

  // 1. Encontrar IDs de lugares existentes para este owner
  const existingPlaces = await prisma.place.findMany({
    where: { owner_id: user.id },
    select: { id: true }
  });
  const pIds = existingPlaces.map(p => p.id);

  console.log(`🗑️ Limpiando ${pIds.length} lugares previos y sus relaciones...`);
  
  if (pIds.length > 0) {
    await prisma.placeTranslation.deleteMany({ where: { place_id: { in: pIds } } });
    await prisma.placeAmenity.deleteMany({ where: { place_id: { in: pIds } } });
    await prisma.placeImage.deleteMany({ where: { place_id: { in: pIds } } });
    await prisma.place.deleteMany({ where: { id: { in: pIds } } });
  }

  // 2. HOTEL: Hotel Concierge (Calle 78)
  console.log('🏨 Creando HOTEL CONCIERGE (Calle 19 x 78)...');
  await prisma.place.create({
    data: {
      owner_id: user.id,
      category_id: 1,
      name: 'Hotel Concierge Progreso',
      lat: 21.2847,
      lng: -89.6640,
      status: 'PENDING',
      phone: '+52 969 935 0101',
      address: 'Calle 19 No. 156 x 78 y 80, Malecón',
      stars: 3,
      accommodation_type: 'Hotel Estándar',
      house_rules: 'No se permiten ruidos fuertes después de las 11 PM.',
      cancellation_policy: 'Cancelación gratuita hasta 24h antes.',
      slogan: 'Tu punto de partida en Progreso',
      opening_hours: 'Lunes a Domingo: 24 Horas',
      amenities: {
        create: [
          { amenity: { connect: { slug: 'wifi_free' } } },
          { amenity: { connect: { slug: 'parking_free' } } }
        ]
      },
      translations: {
        create: { language_code: 'es', description: 'Hotel moderno y confortable a solo unos pasos del muelle principal y el malecón.' }
      }
    }
  });

  // 3. TURISMO: Museo del Meteorito (Calle 66)
  console.log('🌋 Creando MUSEO DEL METEORITO (Calle 19 x 66)...');
  await prisma.place.create({
    data: {
      owner_id: user.id,
      category_id: 3,
      name: 'Museo del Meteorito "El Origen de la Nueva Vida"',
      lat: 21.2852,
      lng: -89.6600,
      status: 'PENDING',
      address: 'Calle 19 x 66, Malecón Internacional',
      accommodation_type: 'Cultural',
      slogan: 'Descubre la historia que cambió el mundo',
      price_adult: 250,
      price_child: 150,
      price_local: 0,
      estimated_duration: '1.5 Horas',
      opening_hours: 'Lunes a Domingo: 11:00 AM - 07:00 PM',
      amenities: {
        create: [
          { amenity: { connect: { slug: 'visitor_center' } } },
          { amenity: { connect: { slug: 'photo_spot_3' } } },
          { amenity: { connect: { slug: 'signage_info' } } }
        ]
      },
      translations: {
        create: { language_code: 'es', description: 'Museo interactivo sobre el impacto del meteorito y la extinción de los dinosaurios.' }
      }
    }
  });

  // 4. RESTAURANTE: La Casa del Pastel (Calle 60)
  console.log('🍴 Creando LA CASA DEL PASTEL (Calle 19 x 60)...');
  await prisma.place.create({
    data: {
      owner_id: user.id,
      category_id: 2,
      name: 'Restaurante & Cafe La Casa del Pastel',
      lat: 21.2858,
      lng: -89.6540,
      status: 'PENDING',
      address: 'Calle 19 No. 100 x 60, Malecón',
      accommodation_type: 'Internacional',
      featured_dish: 'Famosos Postres y Desayunos frente al mar',
      price_range: 3,
      capacity: 80,
      stay_time: '1 Hora',
      opening_hours: 'Lunes a Domingo: 08:00 AM - 10:00 PM',
      amenities: {
        create: [
          { amenity: { connect: { slug: 'ocean_view' } } },
          { amenity: { connect: { slug: 'terrace_outdoor' } } },
          { amenity: { connect: { slug: 'craft_beer' } } }
        ]
      },
      translations: {
        create: { language_code: 'es', description: 'Edificio icónico de Progreso con una arquitectura única y comida deliciosa.' }
      }
    }
  });

  console.log('✅ ¡Lugares reales del Malecón creados con éxito!');
  await prisma.$disconnect();
}

populateRealDemo().catch(e => { console.error(e); process.exit(1); });
