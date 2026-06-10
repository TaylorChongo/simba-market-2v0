const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

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

const addUser = async (req, res) => {
  const { name, email, password, role, branch } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        branch,
      },
    });

    // Log the action
    await prisma.securityLog.create({
      data: {
        userId: req.user.id,
        action: 'ADD_USER',
        details: `Created new user ${user.email} with role ${role}`,
        ip: req.ip,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error adding user', error: error.message });
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

// Helper to get date range and grouping
const getPeriodRange = (period, startDate, endDate) => {
  const now = new Date();
  let fromDate;
  let toDate = new Date(now);
  let grouping = 'day';

  if (period === 'custom' && startDate && endDate) {
    fromDate = new Date(startDate);
    toDate = new Date(endDate);
    const diffDays = Math.ceil(Math.abs(toDate - fromDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 60) grouping = 'month';
    else if (diffDays > 14) grouping = 'day';
    else grouping = 'day';
  } else {
    switch (period) {
      case '7d':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        grouping = 'day';
        break;
      case '30d':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        grouping = 'day';
        break;
      case '90d':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        grouping = 'week';
        break;
      case '180d':
        fromDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        grouping = 'month';
        break;
      case '1y':
        fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        grouping = 'month';
        break;
      default:
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        grouping = 'day';
    }
  }

  fromDate.setHours(0, 0, 0, 0);
  if (toDate.toDateString() !== now.toDateString()) {
    toDate.setHours(23, 59, 59, 999);
  }

  return { fromDate, toDate, grouping };
};

// System Analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = '7d', startDate, endDate } = req.query;
    console.log(`[Backend] getAnalytics request - period: ${period}, startDate: ${startDate}, endDate: ${endDate}`);
    
    const { fromDate, toDate, grouping } = getPeriodRange(period, startDate, endDate);
    console.log(`[Backend] Computed range: ${fromDate.toISOString()} to ${toDate.toISOString()}, grouping: ${grouping}`);

    const [
      userCount, 
      orderCount, 
      productCount, 
      revenue,
      prevUserCount,
      prevOrderCount,
      prevRevenue,
      filteredOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
      prisma.user.count({ where: { createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.order.count({ where: { createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED', createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        _sum: { totalPrice: true },
      }),
      prisma.order.findMany({
        where: { 
          createdAt: { gte: fromDate, lte: toDate } 
        },
        select: { createdAt: true, totalPrice: true, status: true },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const diff = ((current - previous) / previous) * 100;
      return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const aggregatedData = {};
    
    // Helper for timezone-safe keys (using local date parts)
    const getDateKey = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    if (grouping === 'day') {
      const iterDate = new Date(fromDate);
      while (iterDate <= toDate) {
        const key = getDateKey(iterDate);
        aggregatedData[key] = { count: 0, revenue: 0 };
        iterDate.setDate(iterDate.getDate() + 1);
      }
      filteredOrders.forEach(order => {
        const key = getDateKey(order.createdAt);
        if (aggregatedData[key]) {
          aggregatedData[key].count++;
          if (order.status === 'COMPLETED') aggregatedData[key].revenue += order.totalPrice;
        }
      });
    } else if (grouping === 'week') {
      const iterDate = new Date(fromDate);
      iterDate.setDate(iterDate.getDate() - iterDate.getDay());
      iterDate.setHours(0,0,0,0);

      while (iterDate <= toDate) {
        const key = getDateKey(iterDate);
        aggregatedData[key] = { 
          count: 0, 
          revenue: 0, 
          label: `Week of ${iterDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` 
        };
        iterDate.setDate(iterDate.getDate() + 7);
      }

      filteredOrders.forEach(order => {
        const d = new Date(order.createdAt);
        const sunday = new Date(d);
        sunday.setDate(d.getDate() - d.getDay());
        sunday.setHours(0,0,0,0);
        const key = getDateKey(sunday);
        
        if (aggregatedData[key]) {
          aggregatedData[key].count++;
          if (order.status === 'COMPLETED') aggregatedData[key].revenue += order.totalPrice;
        }
      });
    } else if (grouping === 'month') {
      const iterDate = new Date(fromDate);
      iterDate.setDate(1);
      iterDate.setHours(0,0,0,0);

      while (iterDate <= toDate) {
        const key = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}`;
        aggregatedData[key] = { 
          count: 0, 
          revenue: 0, 
          label: iterDate.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) 
        };
        iterDate.setMonth(iterDate.getMonth() + 1);
      }

      filteredOrders.forEach(order => {
        const d = new Date(order.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (aggregatedData[key]) {
          aggregatedData[key].count++;
          if (order.status === 'COMPLETED') aggregatedData[key].revenue += order.totalPrice;
        }
      });
    }

    const graphData = Object.keys(aggregatedData).sort().map(key => ({
      date: key,
      ...aggregatedData[key]
    }));

    console.log(`[Backend] Returning ${graphData.length} graph points`);

    res.json({
      stats: {
        totalUsers: userCount,
        totalOrders: orderCount,
        totalProducts: productCount,
        totalRevenue: revenue._sum.totalPrice || 0,
        trends: {
          users: calculateTrend(userCount, prevUserCount),
          orders: calculateTrend(orderCount, prevOrderCount),
          revenue: calculateTrend(revenue._sum.totalPrice || 0, prevRevenue._sum.totalPrice || 0),
          products: '+2.4%'
        }
      },
      graphData
    });
  } catch (error) {
    console.error('[Analytics Error]:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

const generateReport = async (req, res) => {
  try {
    const { period = '7d', startDate, endDate } = req.query;
    const { fromDate, toDate } = getPeriodRange(period, startDate, endDate);
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate }
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV
    let csv = 'Order ID,Date,Customer,Email,Total Price (RWF),Status,Items\n';
    orders.forEach(order => {
      const items = order.items.map(i => `${i.product.name} (x${i.quantity})`).join(' | ');
      const date = order.createdAt.toLocaleDateString();
      csv += `${order.id},${date},"${order.user.name}",${order.user.email},${order.totalPrice},${order.status},"${items}"\n`;
    });

    let filename = `Simba_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    if (period === 'custom') {
      filename = `Simba_Report_Custom_${startDate}_to_${endDate}.csv`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = {
  getUsers,
  addUser,
  updateUserRole,
  deleteUser,
  getPermissions,
  assignPermissionToRole,
  getSettings,
  updateSetting,
  getLogs,
  getAnalytics,
  generateReport,
};
