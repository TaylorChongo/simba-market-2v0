const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/db');

const branches = [
  'Simba Supermarket Remera',
  'Simba Supermarket Kimironko',
  'Simba Supermarket Kacyiru',
  'Simba Supermarket Nyamirambo',
  'Simba Supermarket Gikondo',
  'Simba Supermarket Kanombe',
  'Simba Supermarket Kinyinya',
  'Simba Supermarket Kibagabaga',
  'Simba Supermarket Nyanza',
];

async function ensureCatalogSeeded() {
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    return { seeded: false, productCount: existingProducts };
  }

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

  const dataPath = path.join(__dirname, '../../data/simba_products.json');
  const { products } = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        price: productData.price,
        category: productData.category,
        image: productData.image,
        description: productData.description || `Fresh ${productData.name} from Simba Supermarket`,
        vendorId: admin.id,
      },
    });

    await prisma.branchStock.createMany({
      data: branches.map((branchName) => ({
        productId: product.id,
        branchName,
        stock: Math.floor(Math.random() * 41) + 10,
      })),
    });
  }

  return { seeded: true, productCount: products.length };
}

module.exports = {
  ensureCatalogSeeded,
  branches,
};
