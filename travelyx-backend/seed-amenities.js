require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAmenities() {
  // IDs: 1: Hotel, 2: Restaurant, 3: Tourist Spot
  const amenities = [
    // --- SERVICIOS UNIVERSALES (1, 2, 3) ---
    { slug: 'wifi_free',       group: 'Conectividad', categories: [1, 2, 3], name_es: 'Wi-Fi Gratis',       name_en: 'Free Wi-Fi' },
    { slug: 'parking_free',    group: 'Logística',    categories: [1, 2, 3], name_es: 'Estacionamiento Gratis', name_en: 'Free Parking' },
    { slug: 'accessibility',   group: 'Servicios',    categories: [1, 2, 3], name_es: 'Accesibilidad Motriz',   name_en: 'Wheelchair Accessible' },
    { slug: 'pet_friendly',    group: 'Ambiente',     categories: [1, 2, 3], name_es: 'Pet Friendly',       name_en: 'Pet Friendly' },
    { slug: 'clean_point',     group: 'Sostenibilidad', categories: [1, 2, 3], name_es: 'Punto de Reciclaje',  name_en: 'Recycling Point' },

    // --- HOTEL ESPECÍFICO (1) ---
    { slug: 'pool_rooftop',    group: 'Bienestar',    categories: [1],       name_es: 'Alberca en Rooftop',  name_en: 'Rooftop Pool' },
    { slug: 'gym_24h',         group: 'Bienestar',    categories: [1],       name_es: 'Gimnasio 24/7',     name_en: '24/7 Gym' },
    { slug: 'spa_full',        group: 'Bienestar',    categories: [1],       name_es: 'Spa & Masajes',      name_en: 'Spa & Massage' },
    { slug: 'jacuzzi_priv',    group: 'Bienestar',    categories: [1],       name_es: 'Jacuzzi Privado',    name_en: 'Private Jacuzzi' },
    { slug: 'room_service',    group: 'Servicios',    categories: [1],       name_es: 'Servicio al Cuarto', name_en: 'Room Service' },
    { slug: 'breakfast_buff',  group: 'Alimentación', categories: [1],       name_es: 'Desayuno Buffet',    name_en: 'Buffet Breakfast' },
    { slug: 'shuttle_airport', group: 'Logística',    categories: [1],       name_es: 'Traslado al Aeropuerto', name_en: 'Airport Shuttle' },
    { slug: 'coworking_area',  group: 'Conectividad', categories: [1],       name_es: 'Zona de Coworking',  name_en: 'Coworking Space' },
    { slug: 'adults_only',     group: 'Ambiente',     categories: [1],       name_es: 'Solo Adultos',       name_en: 'Adults Only' },
    { slug: 'kids_club_hotel', group: 'Servicios',    categories: [1],       name_es: 'Kids Club',         name_en: 'Kids Club' },

    // --- RESTAURANTE ESPECÍFICO (2) ---
    { slug: 'live_music_res',  group: 'Ambiente',     categories: [2],       name_es: 'Música en Vivo',     name_en: 'Live Music' },
    { slug: 'ocean_view',      group: 'Ambiente',     categories: [2],       name_es: 'Vista al Mar',       name_en: 'Ocean View' },
    { slug: 'romantic_vibes',  group: 'Ambiente',     categories: [2],       name_es: 'Cena Romántica',     name_en: 'Romantic Dinner' },
    { slug: 'terrace_outdoor', group: 'Ambiente',     categories: [2],       name_es: 'Terraza al Aire Libre', name_en: 'Outdoor Terrace' },
    { slug: 'valet_parking',   group: 'Logística',    categories: [2],       name_es: 'Valet Parking',      name_en: 'Valet Parking' },
    { slug: 'vegan_options',   group: 'Dieta',        categories: [2],       name_es: 'Opciones Veganas',    name_en: 'Vegan Options' },
    { slug: 'gluten_free_res', group: 'Dieta',        categories: [2],       name_es: 'Platillos Sin Gluten', name_en: 'Gluten Free' },
    { slug: 'wine_cellar_res', group: 'Bebidas',      categories: [2],       name_es: 'Cava de Vinos',      name_en: 'Wine Cellar' },
    { slug: 'craft_beer',      group: 'Bebidas',      categories: [2],       name_es: 'Cerveza Artesanal',  name_en: 'Craft Beer' },
    { slug: 'bar_mixology',    group: 'Bebidas',      categories: [2],       name_es: 'Coctelería de Autor', name_en: 'Signature Cocktails' },
    { slug: 'kids_area_res',   group: 'Servicios',    categories: [2],       name_es: 'Área Infantil',      name_en: 'Kids Area' },
    { slug: 'sports_tv',       group: 'Ambiente',     categories: [2],       name_es: 'Transmisión de Deportes', name_en: 'Sports TV' },

    // --- ZONA TURÍSTICA ESPECÍFICO (3) ---
    { slug: 'guided_tours',    group: 'Experiencia', categories: [3],       name_es: 'Tours Guiados',      name_en: 'Guided Tours' },
    { slug: 'hiking_trails',   group: 'Experiencia', categories: [3],       name_es: 'Senderos / Caminata', name_en: 'Hiking Trails' },
    { slug: 'birdwatching',    group: 'Experiencia', categories: [3],       name_es: 'Avistamiento de Aves', name_en: 'Birdwatching' },
    { slug: 'mangrove_tour',   group: 'Experiencia', categories: [3],       name_es: 'Tour en Manglares',   name_en: 'Mangrove Tour' },
    { slug: 'photo_spot_3',    group: 'Experiencia', categories: [3],       name_es: 'Punto para Fotos',    name_en: 'Photo Spot' },
    { slug: 'visitor_center',  group: 'Instalaciones', categories: [3],       name_es: 'Centro de Visitantes', name_en: 'Visitor Center' },
    { slug: 'restrooms_pub',   group: 'Instalaciones', categories: [3],       name_es: 'Baños Públicos',     name_en: 'Public Restrooms' },
    { slug: 'hydration_point', group: 'Instalaciones', categories: [3],       name_es: 'Zona de Hidratación', name_en: 'Hydration Station' },
    { slug: 'signage_info',    group: 'Instalaciones', categories: [3],       name_es: 'Señalización Informativa', name_en: 'Info Signage' },
    { slug: 'lockers_safe',    group: 'Servicios',    categories: [3],       name_es: 'Lockers / Casilleros', name_en: 'Lockers' },
    { slug: 'no_plastic_zone', group: 'Sostenibilidad', categories: [3],       name_es: 'Zona Libre de Plástico', name_en: 'Plastic Free' },
    { slug: 'protected_area',  group: 'Sostenibilidad', categories: [3],       name_es: 'Área Protegida',     name_en: 'Protected Area' },
    { slug: 'night_show',      group: 'Experiencia', categories: [3],       name_es: 'Show Nocturno / Luces', name_en: 'Night Show' },
  ];

  console.log('🚀 Sembrando el catálogo MAESTRO de amenidades (Filtrado por Categoría)...');

  for (const item of amenities) {
    const { categories, ...amenityData } = item;
    
    // 1. Crear o Actualizar Amenidad
    const upserted = await prisma.amenity.upsert({
      where: { slug: amenityData.slug },
      update: { 
        group: amenityData.group, 
        name_es: amenityData.name_es, 
        name_en: amenityData.name_en 
      },
      create: amenityData
    });

    // 2. Vincular con Categorías (Limpiar vínculos viejos primero para este slug)
    await prisma.categoryAmenity.deleteMany({
      where: { amenity_id: upserted.id }
    });

    for (const catId of categories) {
      await prisma.categoryAmenity.create({
        data: {
          category_id: catId,
          amenity_id: upserted.id
        }
      });
    }
  }

  console.log(`✅ ¡Misión cumplida! Se han configurado ${amenities.length} amenidades especializadas.`);
  await prisma.$disconnect();
}

seedAmenities().catch(e => { console.error(e); process.exit(1); });
