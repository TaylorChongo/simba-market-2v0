const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixManager() {
  const result = await prisma.user.updateMany({
    where: { email: 'manager@gmail.com' },
    data: { branch: 'Simba Supermarket Kicukiro' }
  });
  console.log('Update result:', result);
}

fixManager().finally(() => prisma.$disconnect());
