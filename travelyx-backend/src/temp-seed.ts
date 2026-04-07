import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('superadmin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@travelyx.com' },
    update: {
      must_change_password: false,
      role: 'SUPERADMIN'
    },
    create: {
      email: 'admin@travelyx.com',
      password_hash: passwordHash,
      role: 'SUPERADMIN',
      must_change_password: false
    }
  });
  
  console.log('✅ Admin user created or updated successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
