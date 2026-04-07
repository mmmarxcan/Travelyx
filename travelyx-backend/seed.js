require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@travelyx.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  SuperAdmin user already exists. Skipping...');
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('superadmin123', saltRounds);

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@travelyx.com',
        full_name: 'Super Admin',
        password_hash: passwordHash,
        role: 'SUPERADMIN',
        is_active: true,
        must_change_password: false,
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
