const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = {
  "Habitación estándar, 1 cama matrimonial": "Standard Room, 1 Double Bed",
  "Habitación estándar, 1 cama King size": "Standard Room, 1 King Size Bed",
  "Suite Master con Terraza y Vista al Mar.": "Master Suite with Terrace and Ocean View.",
  "Suite Junior con Vista al Mar.": "Junior Suite with Ocean View.",
  "Fetuccini Mar y Tierra": "Surf and Turf Fettuccine",
  "Pancakes de la casa + cafe ": "House Pancakes + Coffee",
  "Recorrido Guiado Científico": "Guided Scientific Tour",
  "Experiencia de Realidad Virtual": "Virtual Reality Experience",
  "Pesca Recreativa (Trae tu equipo)": "Recreational Fishing (Bring your own gear)",
  "Sesión Fotográfica al Atardecer": "Sunset Photoshoot",
  "Habitación Superior con Vista al Mar": "Superior Room with Ocean View",
  "Loft Premium con Vista al Mar": "Premium Loft with Ocean View",
  "Domo Suite Premium con vista o jardín privado": "Premium Dome Suite with view or private garden",
  "Habitación Superior con Cama King Size y Vista al Mar": "Superior Room with King Size Bed and Ocean View",
  "Suite con Vista al Mar": "Suite with Ocean View",
  "Habitación Doble con Aire Acondicionado": "Double Room with Air Conditioning",
  "Habitación King Vista al Mar": "King Room with Ocean View",
  "Habitación Superior King": "Superior King Room",
  "Habitación Superior con Vista al Mar.": "Superior Room with Ocean View.",
  "Taco de Pastor": "Al Pastor Taco",
  "Pizza de Mariscos ": "Seafood Pizza",
  "Filete Relleno Mariscos": "Seafood Stuffed Fillet",
  "Mantitas de Cangrejo ": "Crab Mantitas",
  "Capresse Pizza": "Caprese Pizza",
  "Filete de pescado ": "Fish Fillet",
  "Langosta Emplatada ": "Plated Lobster",
  "Salbutes con mariscos ": "Seafood Salbutes",
  "Empanadas de queso de bola y camarones ": "Edam Cheese and Shrimp Empanadas",
  "Camarones al coco relleno de queso crema ": "Coconut Shrimp stuffed with Cream Cheese",
  "Pizza Grande 1 ingrediente ": "Large 1-Topping Pizza",
  "Filete de pescado al Grill": "Grilled Fish Fillet",
  "Pescado Frito": "Fried Fish",
  "Pizza Napolitana ": "Neapolitan Pizza",
  "Mac & Cheese con camarón ": "Mac & Cheese with Shrimp",
  "Tacos de camarón ": "Shrimp Tacos",
  "Tostadas de camarón ": "Shrimp Tostadas",
  "Filete de pescado al gusto": "Fish Fillet to taste",
  "Ceviches de pulpo ": "Octopus Ceviche",
  "Camarones ": "Shrimp",
  "Luxury Burger ": "Luxury Burger",
  "Orden de filete de pescado ": "Fish Fillet Order"
};

async function main() {
  const places = await prisma.place.findMany({
    where: { custom_prices: { not: null } }
  });
  
  let updatedCount = 0;
  for (const p of places) {
    if (p.custom_prices) {
      try {
        const prices = JSON.parse(p.custom_prices);
        let modified = false;
        
        prices.forEach(price => {
          if (price.label && translations[price.label] && !price.label_en) {
            price.label_en = translations[price.label];
            modified = true;
          }
        });
        
        if (modified) {
          await prisma.place.update({
            where: { id: p.id },
            data: { custom_prices: JSON.stringify(prices) }
          });
          updatedCount++;
        }
      } catch (e) {
        console.error("Error parsing custom_prices for place ID " + p.id, e);
      }
    }
  }
  
  console.log(`Successfully updated ${updatedCount} places with English translations.`);
  await prisma.$disconnect();
}

main().catch(console.error);
