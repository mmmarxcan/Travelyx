const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function transferPlaces() {
  const fromEmail = 'mmmarxcan@gmail.com';
  const toEmail = 'algo@gmail.com';

  console.log(`🔍 Buscando usuarios...`);
  
  const fromUser = await prisma.user.findUnique({ where: { email: fromEmail } });
  const toUser = await prisma.user.findUnique({ where: { email: toEmail } });

  if (!fromUser || !toUser) {
    console.error(`❌ No se encontró uno de los usuarios.`);
    console.log(`   De: ${fromEmail} (${fromUser ? 'OK' : 'No encontrado'})`);
    console.log(`   A:  ${toEmail} (${toUser ? 'OK' : 'No encontrado'})`);
    return;
  }

  console.log(`🔄 Transfiriendo lugares de ${fromEmail} (ID: ${fromUser.id}) a ${toEmail} (ID: ${toUser.id})...`);

  const updateResult = await prisma.place.updateMany({
    where: { owner_id: fromUser.id },
    data: { owner_id: toUser.id }
  });

  console.log(`✅ ¡Transferencia completada!`);
  console.log(`   Se actualizaron ${updateResult.count} lugares.`);

  await prisma.$disconnect();
}

transferPlaces().catch(e => {
  console.error('❌ Error durante la transferencia:', e);
  process.exit(1);
});
