const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populate() {
  console.log('🗑️  Limpiando datos anteriores...');
  await prisma.placeTranslation.deleteMany({});
  await prisma.placeAmenity.deleteMany({});
  await prisma.placeImage.deleteMany({});
  await prisma.place.deleteMany({});

  // Coordenadas del Malecón de Progreso
  // El eje Y (lat) está alrededor de 21.2878–21.2890
  // El eje X (lng) va de -89.6645 (C.80) a -89.6519 (C.60)
  const places = [

    // ─── ZONAS TURÍSTICAS ─────────────────────────────────────────────────────
    {
      category_id: 3, name: 'Estatua de Juan Miguel Castro', icon: '🗿',
      lat: 21.28790, lng: -89.66400,
      address: 'Calle 19 x 80, Malecón Tradicional, Progreso',
      opening_hours: 'Abierto 24hs',
      description_es: 'Monumento emblemático que rinde homenaje al fundador del puerto de Progreso. Punto de inicio del Malecón Tradicional y referencia histórica imprescindible para conocer la identidad del puerto.'
    },
    {
      category_id: 3, name: 'Parque de la Paz (Malecón)', icon: '🌿',
      lat: 21.28830, lng: -89.66000,
      address: 'Calle 71, Boulevard Turístico Malecón, Progreso',
      opening_hours: 'Abierto 24hs',
      description_es: 'Espacio público frente al mar con áreas de descanso, bancas y jardinería. Ideal para sentarse a contemplar el atardecer sobre el Golfo de México y el imponente muelle de Progreso.'
    },
    {
      category_id: 3, name: 'Letras de Progreso (Parador Fotográfico)', icon: '📷',
      lat: 21.28850, lng: -89.65760,
      address: 'Calle 19 x 72, Boulevard Turístico Malecón, Progreso',
      opening_hours: 'Abierto 24hs',
      description_es: 'El parador fotográfico más popular del puerto. Las letras tridimensionales de Progreso con fondo del mar son el recuerdo obligatorio de cualquier visita al malecón.'
    },
    {
      category_id: 3, name: 'Museo del Meteorito "El Origen"', icon: '☄️',
      lat: 21.28845, lng: -89.65740,
      address: 'Calle 19 x 68-70, Boulevard Turístico Malecón, Progreso',
      opening_hours: 'Lun–Dom: 10:00 AM – 7:00 PM',
      price_adult: 200, price_child: 100,
      estimated_duration: '1.5 Horas',
      description_es: 'Museo interactivo de clase mundial dedicado al impacto del asteroide Chicxulub en las costas de Yucatán y su papel en la extinción de los dinosaurios. Exhibiciones inmersivas, fósiles reales y tecnología de realidad aumentada.'
    },
    {
      category_id: 3, name: 'La Casa del Pastel', icon: '🍰',
      lat: 21.28874, lng: -89.65200,
      address: 'Calle 19 x 60, Playa Progreso, Progreso',
      opening_hours: 'Abierto 24hs (exterior)',
      description_es: 'Joya arquitectónica de principios del siglo XX cuya singular forma escalonada recuerda a un pastel de bodas. Símbolo del glamour veraniego de la élite meridana y uno de los edificios históricos más fotografiados de la costa yucateca.'
    },
    {
      category_id: 3, name: 'Muelle de Chocolate', icon: '🍫',
      lat: 21.28910, lng: -89.66610,
      address: 'Final del Malecón Internacional, Progreso',
      opening_hours: 'Abierto 24hs',
      description_es: 'Muelle de madera que conecta el Malecón Tradicional con el Internacional. Su tono oscuro le dio el apodo popular "Muelle de Chocolate". Perfecto para caminar al atardecer y tomar fotografías con vista al muelle de cruceros más largo del mundo.'
    },

    // ─── HOTELES ──────────────────────────────────────────────────────────────
    {
      category_id: 1, name: 'Hotel Playa Linda', icon: '🏨',
      lat: 21.28760, lng: -89.66130,
      address: 'Calle 76 x 19 y 21, Centro, Progreso',
      phone: '+52 969 935 0222',
      stars: 2, accommodation_type: 'Hotel Familiar',
      opening_hours: 'Recepción 24hs',
      slogan: 'A pasos del mar',
      price_range: 1,
      description_es: 'Hotel familiar con ambiente tranquilo y cercano al malecón. Habitaciones cómodas y servicio atento, ideal para familias que buscan disfrutar de las playas de Progreso sin gastar de más.'
    },
    {
      category_id: 1, name: 'Hotel & Suites Domani', icon: '🌊',
      lat: 21.28840, lng: -89.65760,
      address: 'C. 19 #144 F, entre 72 y 74, frente al mar, Centro, Progreso',
      phone: '+52 969 935 0800',
      website_url: 'https://hoteldomani.com',
      stars: 3, accommodation_type: 'Hotel de Playa',
      opening_hours: 'Recepción 24hs',
      slogan: 'Despierte frente al mar',
      price_range: 2,
      description_es: 'Modernas suites directamente frente al mar con balcón privado y vista panorámica al Golfo de México. Incluye desayuno continental, acceso a la playa y servicio de cuartos. Ubicación privilegiada en el corazón del malecón.'
    },
    {
      category_id: 1, name: 'Hotel Scappata', icon: '🏛️',
      lat: 21.28855, lng: -89.65450,
      address: 'C. 19, Boulevard Turístico Malecón, Progreso',
      website_url: 'https://hotelscappata.com',
      stars: 4, accommodation_type: 'Hotel Boutique',
      opening_hours: 'Recepción 24hs',
      slogan: 'Lujo mediterráneo frente al mar',
      price_range: 3,
      cancellation_policy: 'Cancelación gratuita hasta 48h antes',
      description_es: 'Hotel boutique inaugurado en 2022 en un icónico edificio remodelado del malecón. Diseño mediterráneo con alberca infinita, habitaciones únicas con vista al mar y acceso directo a la playa. Considerado uno de los mejores hoteles de la costa yucateca.'
    },

    // ─── RESTAURANTES ─────────────────────────────────────────────────────────
    {
      category_id: 2, name: "Eladio's Bar & Restaurant", icon: '🍺',
      lat: 21.28775, lng: -89.66390,
      address: 'Calle 80 & 19, Colonia Centro, Progreso',
      phone: '+52 969 935 0102',
      opening_hours: 'Lun–Dom: 9:00 AM – 11:00 PM',
      price_range: 1, capacity: 200,
      cuisine: 'yucatecan',
      featured_dish: 'Botanas Yucatecas + Margaritas',
      slogan: 'El clásico con botanas ilimitadas',
      description_es: 'Una institución del malecón de Progreso desde 1985. Famoso por sus botanas yucatecas de cortesía al pedir bebidas: ceviches, calamares, pescaditos fritos y más. Imprescindible para vivir la experiencia auténtica del puerto frente al mar.'
    },
    {
      category_id: 2, name: 'Le Saint Bonnet', icon: '🦞',
      lat: 21.28800, lng: -89.66210,
      address: 'Calle 19 #150-DK, entre 78 y 80, Centro, Progreso',
      phone: '+52 969 935 0174',
      website_url: 'https://lesaintbonnet.com',
      opening_hours: 'Lun–Dom: 1:00 PM – 10:00 PM',
      price_range: 3, capacity: 80,
      cuisine: 'seafood',
      featured_dish: 'Pescado relleno de mariscos',
      slogan: 'Alta cocina frente al muelle desde 1991',
      requires_reservation: true,
      description_es: 'El restaurante más legendario del malecón de Progreso, fundado en 1991 por el chef Saint Bonnet. Especialidad en cocina de mariscos con toques franceses: ceviche de pulpo, filete relleno de mariscos y langosta. Una experiencia gastronómica imprescindible.'
    },
    {
      category_id: 2, name: 'El Marinero Restaurant Bar', icon: '⚓',
      lat: 21.28810, lng: -89.66130,
      address: 'C. 76 #123A, Boulevard Turístico Malecón, Progreso',
      opening_hours: 'Lun–Dom: 8:00 AM – 10:00 PM',
      price_range: 2, capacity: 100,
      cuisine: 'seafood',
      featured_dish: 'Ceviche de pulpo y camarones al coco',
      description_es: 'Restaurante-bar con estilo náutico a pie del malecón. Especialistas en mariscos del Golfo: ceviches, aguachiles, filete zarandeado y combinados de mariscos. Un favorito entre los pescadores locales y turistas que buscan sabor auténtico.'
    },
    {
      category_id: 2, name: 'Altavela Seafood', icon: '🌊',
      lat: 21.28800, lng: -89.66010,
      address: 'Calle 19 #50C x 74 y 76, Centro, Progreso',
      opening_hours: 'Lun–Dom: 9:00 AM – 9:00 PM',
      price_range: 2,
      cuisine: 'seafood',
      featured_dish: 'Mariscos frescos del Golfo',
      description_es: 'Restaurante de cocina de mar con terrraza frente al océano. Se distingue por su selección diaria de mariscos ultrafresco del Golfo de México, preparados de forma tradicional yucateca con el toque de las recetas de la abuela.'
    },
    {
      category_id: 2, name: 'Mayaka Sea Food & Snacks', icon: '🥥',
      lat: 21.28840, lng: -89.65960,
      address: 'C. 19 #150, Centro, Progreso',
      opening_hours: 'Lun–Dom: 9:00 AM – 9:00 PM',
      price_range: 2, capacity: 70,
      cuisine: 'seafood',
      featured_dish: 'Camarones al coco + ceviche mixto',
      description_es: 'Beach club con estética estilo Tulum, pequeña alberca en el centro del restaurante y vista al mar. Famoso por sus camarones al coco, tostadas de ceviche y cocteles refrescantes. Perfecto para un día de playa relajado con buena vibra.'
    },
    {
      category_id: 2, name: 'Almadía Progreso', icon: '⛵',
      lat: 21.28840, lng: -89.65840,
      address: 'C. 19 #138, Boulevard Turístico Malecón, Progreso',
      website_url: 'https://almadia.mx',
      opening_hours: 'Lun–Dom: 8:00 AM – 11:00 PM',
      price_range: 3, capacity: 150,
      cuisine: 'seafood',
      featured_dish: 'Pulpo a la yucateca + Tacos de langosta',
      slogan: 'Eco Chic frente al mar',
      requires_reservation: true,
      description_es: 'Concepto gastronómico "Eco Chic" considerado uno de los mejores restaurantes del malecón. Ofrece cocina de autor con productos del mar: langosta, pulpo, ceviches y parrilla premium. Terraza abierta con brisas del Golfo e impresionantes atardeceres.'
    },
    {
      category_id: 2, name: 'Mobula', icon: '🐟',
      lat: 21.28845, lng: -89.65820,
      address: 'Boulevard Turístico Malecón, Progreso',
      opening_hours: 'Lun–Dom: 8:00 AM – 12:00 AM',
      price_range: 2, capacity: 180,
      cuisine: 'seafood',
      featured_dish: 'Arroz con mariscos + Pescado del día',
      description_es: 'Amplio restaurante de "Cocina de Mar" con terraza frente al Golfo y palapas a pie de playa. Menú extenso desde desayunos hasta cenas: cebiches, pescado sarandeado, molcajetes y cocteles. Uno de los favoritos para grupos grandes en el malecón.'
    },
    {
      category_id: 2, name: 'Los Mariscos de Chichí', icon: '🦐',
      lat: 21.28843, lng: -89.65780,
      address: 'C. 19 #144D, Centro, Progreso',
      phone: '+52 999 994 1607',
      opening_hours: 'Lun–Dom: 8:00 AM – 11:00 PM',
      price_range: 2, capacity: 90,
      cuisine: 'seafood',
      featured_dish: 'Aguachile negro + Ceviche de pulpo',
      description_es: 'Marisquería con palapa y vista al mar, reconocida por la frescura de sus ingredientes y la generosidad de sus porciones. Desde el desayuno con mariscadas hasta la cena, el sabor casero de Chichí es un secreto a voces en el puerto.'
    },
    {
      category_id: 2, name: 'Restaurante Scappata Casa Di Mare', icon: '🍕',
      lat: 21.28853, lng: -89.65455,
      address: 'C. 19, Boulevard Turístico Malecón, Progreso',
      website_url: 'https://hotelscappata.com',
      opening_hours: 'Lun–Dom: 7:00 AM – 11:00 PM',
      price_range: 3, capacity: 100,
      cuisine: 'italian',
      featured_dish: 'Pizza al horno de leña + Pasta con mariscos',
      requires_reservation: true,
      description_es: 'El restaurante boutique del Hotel Scappata: fusión mediterránea, italiana y de mariscos en un ambiente elegante frente al mar. Sus pizzas al horno de leña, risottos y carpaccios de pulpo son los favoritos de la crítica gastronómica yucateca.'
    },
    {
      category_id: 2, name: 'Toast and Coast', icon: '🥂',
      lat: 21.28848, lng: -89.65690,
      address: 'C. 19 #142, entre 68 y 70, Boulevard Turístico Malecón, Progreso',
      opening_hours: 'Lun–Dom: 8:00 AM – 9:00 PM',
      price_range: 2, capacity: 60,
      cuisine: 'breakfast',
      featured_dish: 'Desayunos gourmet + Fish & Chips',
      description_es: 'Restaurante-café de playa con vista al Golfo y camastros incluidos para los comensales. Ambiente relajado con música lo-fi y brisa marina. Famoso por sus desayunos gourmet, acai bowls y brunchs de fin de semana. El spot perfecto para quien busca calidad y tranquilidad.'
    },
    {
      category_id: 2, name: 'MIXE Taquería Oaxaca Progreso', icon: '🌮',
      lat: 21.28830, lng: -89.66045,
      address: 'C. 71 #1687, Boulevard Turístico Malecón, Progreso',
      opening_hours: 'Lun–Dom: 9:00 AM – 1:00 AM',
      price_range: 1, capacity: 50,
      cuisine: 'mexican',
      featured_dish: 'Huaraches con chorizo + Tacos al pastor',
      description_es: 'Auténtica taquería de inspiración oaxaqueña en pleno boulevard del malecón. Famosa por sus huaraches, tlayudas, queso fundido y tacos al pastor con ingredientes traídos directamente de Oaxaca. Un festín de sabores del sur de México a buen precio.'
    },
    {
      category_id: 2, name: "Messina's Pizza", icon: '🍕',
      lat: 21.28820, lng: -89.66020,
      address: 'C. 71 #5, Boulevard Turístico Malecón, Progreso',
      opening_hours: 'Lun–Dom: 12:00 PM – 11:00 PM',
      price_range: 1, delivery: true,
      cuisine: 'italian',
      featured_dish: 'Pizzas artesanales',
      description_es: 'Sucursal de la reconocida cadena de pizzerías yucatecas. Masa casera crujiente con ingredientes frescos, disponible en versiones clásicas y especiales de la casa. También ofrece pastas, baguettes y ensaladas. Con servicio a domicilio.'
    },
    {
      category_id: 2, name: "RESTAURANTE TOMMY'S", icon: '🍽️',
      lat: 21.28823, lng: -89.65600,
      address: 'Calle 69 #150, Centro, Progreso',
      opening_hours: 'Lun–Dom: 10:00 AM – 10:00 PM',
      price_range: 2,
      cuisine: 'yucatecan',
      description_es: 'Restaurante familiar con cocina yucateca y de mariscos en el corazón del centro de Progreso. Sazón casero y ambiente acogedor para disfrutar de platos típicos de la región como el poc chuc, tikin xic y cochinita pibil.'
    },
  ];

  console.log(`🚀 Insertando ${places.length} lugares en la base de datos...`);

  for (const p of places) {
    const { description_es, ...placeData } = p;

    const newPlace = await prisma.place.create({
      data: {
        owner_id: 14,
        is_active: true,
        status: 'APPROVED',
        price_range: 1,
        stars: 0,
        price_adult: 0,
        price_child: 0,
        price_local: 0,
        capacity: 0,
        delivery: false,
        pickup: false,
        requires_reservation: false,
        ...placeData,
      }
    });

    await prisma.placeTranslation.create({
      data: {
        place_id: newPlace.id,
        language_code: 'es',
        description: description_es
      }
    });

    console.log(`  ✅ ${newPlace.name}`);

    // Si es un restaurante, agregar platillos de prueba
    if (p.category_id === 2) {
      const sampleDishes = [
        {
          name_es: 'Ceviche Mixto Especial',
          name_en: 'Special Mixed Ceviche',
          description_es: 'Fresco ceviche de pulpo, camarón y pescado marinado en limón yucateco y habanero.',
          description_en: 'Fresh octopus, shrimp and fish ceviche marinated in Yucatecan lime and habanero.',
          price: 185.00,
          image_url: 'https://images.unsplash.com/photo-1534080564677-6e7b233a76e1?auto=format&fit=crop&q=80&w=800'
        },
        {
          name_es: 'Pescado Tikin Xic',
          name_en: 'Tikin Xic Fish',
          description_es: 'Filete de pescado marinado en achiote y asado a la leña, servido con arroz blanco.',
          description_en: 'Fish fillet marinated in achiote and wood-fired, served with white rice.',
          price: 220.00,
          image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800'
        }
      ];

      for (const dish of sampleDishes) {
        await prisma.dish.create({
          data: {
            place_id: newPlace.id,
            ...dish
          }
        });
      }
      console.log(`     🍴 Añadidos ${sampleDishes.length} platillos.`);
    }
  }

  console.log('\n🎉 ¡Listo! Todos los lugares del Malecón han sido insertados.');
  console.log('   Abre el mapa del kiosko y el sistema traducirá automáticamente al inglés en segundo plano.');
  await prisma.$disconnect();
}

populate().catch(e => {
  console.error('❌ Error al poblar datos:', e.message);
  process.exit(1);
});
