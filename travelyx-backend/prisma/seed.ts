import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Check if the admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@travelyx.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  SuperAdmin user already exists. Skipping...');
      return;
    }

    // Encrypt the default password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('superadmin123', saltRounds);

    // Create the superadmin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@travelyx.com',
        password_hash: passwordHash,
        role: 'SUPERADMIN',
      },
    });

    console.log('✅ Successfully seeded SuperAdmin account:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role:  ${adminUser.role}`);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
