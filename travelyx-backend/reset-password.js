const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'algo@gmail.com';
  const newPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(newPassword, salt);

  console.log(`🔍 Buscando usuario ${email}...`);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ No se encontró el usuario ${email}.`);
    return;
  }

  console.log(`🔄 Actualizando contraseña para el usuario con ID: ${user.id}...`);
  await prisma.user.update({
    where: { id: user.id },
    data: { password_hash, must_change_password: false }
  });

  console.log(`✅ ¡Contraseña actualizada con éxito!`);
  console.log(`   Nueva contraseña: ${newPassword}`);

  await prisma.$disconnect();
}

resetPassword().catch(e => {
  console.error('❌ Error durante el reset:', e);
  process.exit(1);
});
