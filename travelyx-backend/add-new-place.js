const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function add() {
  const newPlace = await prisma.place.create({
    data: {
      owner_id: 14, // Using existing owner from logs
      category_id: 3, // Tourist Spot
      name: 'Muelle de Chocolate',
      lat: 21.2891,
      lng: -89.6661,
      is_active: true,
      status: 'APPROVED',
      address: 'Final del Malecón Internacional, Progreso, Yucatán',
      icon: '🍫',
      translations: {
        create: [
          {
            language_code: 'es',
            description: 'Un muelle icónico construido con madera reciclada, ideal para caminar al atardecer y disfrutar de la brisa marina de Progreso.'
          }
        ]
      }
    }
  });

  console.log('✅ New Place Created: ' + newPlace.name + ' (ID: ' + newPlace.id + ')');
  console.log('Ahora abre el mapa en el Kiosko y cambia a Inglés. ¡Polly traducirá esto automáticamente!');
  
  await prisma.$disconnect();
}

add().catch(e => { console.error(e); process.exit(1); });
