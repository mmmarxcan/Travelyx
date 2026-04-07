const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.place.findMany({ include: { category: true } }).then(places => {
  places.forEach(x => {
    const row = `[${x.category.slug}] ${x.name} | stars:${x.stars} | price_range:${x.price_range} | type:${x.accommodation_type} | delivery:${x.delivery} | reservation:${x.requires_reservation} | price_adult:${x.price_adult} | duration:${x.estimated_duration}`;
    process.stdout.write(row + '\n');
  });
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
