const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User Management
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branch: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_USER_ROLE',
        details: `Updated user ${user.email} role to ${role}`,
        ip: req.ip,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.delete({
      where: { id },
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_USER',
        details: `Deleted user ${user.email}`,
        ip: req.ip,
      },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Roles and Permissions
const getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      include: { roles: true },
    });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching permissions', error: error.message });
  }
};

const assignPermissionToRole = async (req, res) => {
  const { role, permissionId } = req.body;
  try {
    const rolePermission = await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role,
          permissionId,
        },
      },
      update: {},
      create: {
        role,
        permissionId,
      },
    });
    res.json(rolePermission);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning permission', error: error.message });
  }
};

// System Settings
const getSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

const updateSetting = async (req, res) => {
  const { key, value } = req.body;
  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_SETTING',
        details: `Updated setting ${key} to ${value}`,
        ip: req.ip,
      },
    });

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
};

// Security Logs
const getLogs = async (req, res) => {
  try {
    const logs = await prisma.securityLog.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

// System Analytics
const getAnalytics = async (req, res) => {
  try {
    const [userCount, orderCount, productCount, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
    ]);

    // Monthly orders
    const monthlyOrders = await prisma.order.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      _sum: { totalPrice: true },
      // Note: Grouping by exact timestamp isn't great for analytics, 
      // but Prisma's direct support for date truncating is limited without raw queries.
      // For a prototype, we'll just return raw data or handle it in JS.
    });

    res.json({
      stats: {
        totalUsers: userCount,
        totalOrders: orderCount,
        totalProducts: productCount,
        totalRevenue: revenue._sum.totalPrice || 0,
      },
      // In a real app, we'd do more complex grouping here.
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getPermissions,
  assignPermissionToRole,
  getSettings,
  updateSetting,
  getLogs,
  getAnalytics,
};
