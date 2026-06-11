const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/db');

const branches = [
  'Simba Supermarket Centenary (City Centre)',
  'Simba Supermarket Kigali Heights',
  'Simba Supermarket Gishushu',
  'Simba Supermarket Kimironko',
  'Simba Supermarket Kicukiro'
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
        stock: 100,
      })),
    });
  }

  return { seeded: true, productCount: products.length };
}

async function seedAdminData() {
  // Seed Permissions
  const permissions = [
    { name: 'Manage Users', code: 'MANAGE_USERS', description: 'Can create, update, and delete users' },
    { name: 'Manage Roles', code: 'MANAGE_ROLES', description: 'Can assign permissions to roles' },
    { name: 'View Logs', code: 'VIEW_LOGS', description: 'Can view system security logs' },
    { name: 'Manage Settings', code: 'MANAGE_SETTINGS', description: 'Can modify system-wide settings' },
    { name: 'View Analytics', code: 'VIEW_ANALYTICS', description: 'Can view system performance analytics' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, description: perm.description },
      create: perm,
    });
  }

  // Seed default System Settings
  const settings = [
    { key: 'SITE_NAME', value: 'Simba Market' },
    { key: 'MAINTENANCE_MODE', value: 'false' },
    { key: 'SUPPORT_EMAIL', value: 'support@simba.com' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // Assign all permissions to ADMIN role by default
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: 'ADMIN',
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        role: 'ADMIN',
        permissionId: perm.id,
      },
    });
  }
}

module.exports = {
  ensureCatalogSeeded,
  seedAdminData,
  branches,
};
