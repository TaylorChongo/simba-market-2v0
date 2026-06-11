const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkManagers() {
  const managers = await prisma.user.findMany({
    where: { role: 'BRANCH_MANAGER' },
    select: { id: true, name: true, email: true, branch: true }
  });
  console.log('Branch Managers:', JSON.stringify(managers, null, 2));
}

checkManagers().finally(() => prisma.$disconnect());
