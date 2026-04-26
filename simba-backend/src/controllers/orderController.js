const { prisma } = require('../config/db');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private/Client
const createOrder = async (req, res) => {
  try {
    const { items, pickupLocation, pickupTime, depositPaid, depositAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!pickupLocation) {
      return res.status(400).json({ message: 'Pickup location (branch) is required' });
    }

    // Use transaction to ensure stock consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get product details and current stock
      const productIds = items.map((item) => item.productId);
      
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: {
          stocks: {
            where: { branchName: pickupLocation }
          }
        }
      });

      if (products.length !== items.length) {
        throw new Error('One or more products not found');
      }

      // 2. Validate stock and calculate total price
      let totalPrice = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        const branchStock = product.stocks[0];

        if (!branchStock || branchStock.stock < item.quantity) {
          throw new Error(`Some items are out of stock at selected branch`);
        }

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });

        // 3. Update stock
        await tx.branchStock.update({
          where: { id: branchStock.id },
          data: { stock: branchStock.stock - item.quantity }
        });
      }

      // 4. Create Order
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          totalPrice,
          status: 'PENDING',
          branchName: pickupLocation,
          pickupTime,
          depositPaid: depositPaid || false,
          depositAmount: depositAmount || 0,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });

    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes('out of stock') ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my
// @access  Private/Client
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your orders', error: error.message });
  }
};

// @desc    Get all orders for a branch (MANAGER)
// @route   GET /api/branch/orders
// @access  Private/BRANCH_MANAGER
const getBranchOrders = async (req, res) => {
  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const orders = await prisma.order.findMany({
      where: {
        branchName: manager.branch,
      },
      include: {
        user: { select: { name: true, email: true } },
        staff: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branch orders', error: error.message });
  }
};

// @desc    Assign order to staff (MANAGER)
// @route   PUT /api/branch/orders/:id/assign
// @access  Private/BRANCH_MANAGER
const assignOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        assignedTo: staffId,
        assignedBy: req.user.id,
        status: 'ASSIGNED',
      },
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning order', error: error.message });
  }
};

// @desc    Get assigned orders (STAFF)
// @route   GET /api/staff/orders
// @access  Private/BRANCH_STAFF
const getStaffOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        assignedTo: req.user.id,
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff orders', error: error.message });
  }
};

// @desc    Update order status (STAFF)
// @route   PUT /api/staff/orders/:id/status
// @access  Private/BRANCH_STAFF
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PREPARING', 'READY_FOR_PICKUP', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const order = await prisma.order.update({
      where: { id, assignedTo: req.user.id },
      data: { status },
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

// @desc    Get branch staff list (MANAGER)
// @route   GET /api/branch/staff
// @access  Private/BRANCH_MANAGER
const getBranchStaff = async (req, res) => {
  try {
    const manager = await prisma.user.findUnique({ where: { id: req.user.id } });
    const staff = await prisma.user.findMany({
      where: {
        branch: manager.branch,
        role: 'BRANCH_STAFF',
      },
      select: { id: true, name: true, email: true },
    });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getBranchOrders,
  assignOrder,
  getStaffOrders,
  updateOrderStatus,
  getBranchStaff,
};
