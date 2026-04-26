const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const branches = [
  "Simba Supermarket Remera",
  "Simba Supermarket Kimironko",
  "Simba Supermarket Kacyiru",
  "Simba Supermarket Nyamirambo",
  "Simba Supermarket Gikondo",
  "Simba Supermarket Kanombe",
  "Simba Supermarket Kinyinya",
  "Simba Supermarket Kibagabaga",
  "Simba Supermarket Nyanza"
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@simba.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@simba.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created');

  // 2. Load products from local backend data
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/simba_products.json'), 'utf-8'));
  const productsData = data.products;

  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    console.log(`📦 Seeding product [${i+1}/${productsData.length}]: ${p.name}`);
    // Create product
    const product = await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.image,
        description: p.description || `Fresh ${p.name} from Simba Supermarket`,
        vendorId: admin.id, // Assign to admin for now
      }
    });

    // Create stock for each branch
    for (const branch of branches) {
      await prisma.branchStock.create({
        data: {
          productId: product.id,
          branchName: branch,
          stock: Math.floor(Math.random() * 41) + 10, // 10 to 50 units
        }
      });
    }
  }

  console.log(`✅ Seeded ${productsData.length} products with stock for all 9 branches.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
