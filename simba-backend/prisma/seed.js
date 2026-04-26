const { prisma } = require('../src/config/db');
const { ensureCatalogSeeded } = require('../src/services/bootstrapService');

async function main() {
  console.log('Seeding database...');
  const result = await ensureCatalogSeeded();

  if (result.seeded) {
    console.log(`Seeded ${result.productCount} products.`);
  } else {
    console.log(`Skipped product seed because ${result.productCount} products already exist.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
