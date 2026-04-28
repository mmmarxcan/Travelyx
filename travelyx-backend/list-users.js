const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany();
  console.log('--- Usuarios en el sistema ---');
  for (const u of users) {
    console.log(`ID: ${u.id} | Email: ${u.email} | Nombre: ${u.full_name}`);
  }
  await prisma.$disconnect();
}

listUsers().catch(console.error);
