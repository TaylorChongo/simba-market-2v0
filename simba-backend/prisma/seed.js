const { prisma } = require('../src/config/db');
const { ensureCatalogSeeded, seedAdminData } = require('../src/services/bootstrapService');

async function main() {
  console.log('Seeding database...');
  const result = await ensureCatalogSeeded();

  if (result.seeded) {
    console.log(`Seeded ${result.productCount} products.`);
  } else {
    console.log(`Skipped product seed because ${result.productCount} products already exist.`);
  }

  console.log('Seeding admin data (permissions & settings)...');
  await seedAdminData();
  console.log('Admin data seeded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
