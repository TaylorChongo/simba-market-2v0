const { prisma } = require('../config/db');

const MINIMUM_ORDER_TOTAL_RWF = Number(process.env.MINIMUM_ORDER_TOTAL_RWF || 2500);

/**
 * Automatically assigns PENDING orders to available staff in a branch
 */
const autoAssignOrders = async (branchName) => {
  if (!branchName) return;

  try {
    // 1. Get all PENDING orders for this branch, oldest first
    const pendingOrders = await prisma.order.findMany({
      where: { 
        branchName,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'asc' }
    });

    if (pendingOrders.length === 0) return;

    // 2. Get all staff for this branch
    const staffMembers = await prisma.user.findMany({
      where: {
        branch: branchName,
        role: 'BRANCH_STAFF'
      }
    });

    if (staffMembers.length === 0) return;

    // 3. For each pending order, try to find a free staff member
    for (const order of pendingOrders) {
      // Find staff who don't have active (ASSIGNED or PREPARING) orders
      const busyStaffIds = await prisma.order.findMany({
        where: {
          branchName,
          status: { in: ['ASSIGNED', 'PREPARING'] },
          assignedTo: { not: null }
        },
        select: { assignedTo: true }
      }).then(orders => orders.map(o => o.assignedTo));

      const freeStaff = staffMembers.find(s => !busyStaffIds.includes(s.id));

      if (freeStaff) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            assignedTo: freeStaff.id,
            status: 'ASSIGNED'
          }
        });
        console.log(`Auto-assigned order ${order.id} to staff ${freeStaff.name} at branch ${branchName}`);
        
        // After assigning one, we need to refresh busyStaffIds for the next order in the loop
        // but since we are assigning one at a time and a staff member is only free if they have 0 active,
        // once assigned they are no longer free for the next order in this same loop.
      } else {
        // No more free staff, stop trying to assign for now
        break;
      }
    }
  } catch (error) {
    console.error(`Auto-assignment error for branch ${branchName}:`, error.message);
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private/Client
const createOrder = async (req, res) => {
  try {
    const { items, pickupLocation, fulfillmentBranch, deliveryAddress, deliveryInstructions, depositPaid, depositAmount } = req.body;
    const finalBranchName = fulfillmentBranch || pickupLocation;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!finalBranchName) {
      return res.status(400).json({ message: 'Fulfillment branch is required' });
    }

    // Use transaction to ensure stock consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get product details and current stock
      const productIds = items.map((item) => item.productId);
      
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: {
          stocks: {
            where: { branchName: finalBranchName }
          }
        }
      });

      if (products.length !== items.length) {
        throw new Error('One or more products not found');
      }

      // 2. Validate stock and calculate total price
      let totalPrice = 0;
      const orderItemsData = [];
      const stockUpdates = [];

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

        stockUpdates.push({
          id: branchStock.id,
          stock: branchStock.stock - item.quantity
        });
      }

      if (totalPrice < MINIMUM_ORDER_TOTAL_RWF) {
        throw new Error(`Minimum order total is ${MINIMUM_ORDER_TOTAL_RWF.toLocaleString()} RWF`);
      }

      // 3. Update stock
      for (const update of stockUpdates) {
        await tx.branchStock.update({
          where: { id: update.id },
          data: { stock: update.stock }
        });
      }

      // 4. Create Order
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          totalPrice,
          status: 'PENDING',
          branchName: finalBranchName,
          deliveryAddress,
          deliveryInstructions,
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

    // Auto-assignment disabled for manual approval flow
    // autoAssignOrders(pickupLocation);

    res.status(201).json(result);
  } catch (error) {
    const isBadRequest = error.message.includes('out of stock') || error.message.includes('Minimum order total');
    const status = isBadRequest ? 400 : 500;
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

// @desc    Assign order to staff (MANAGER) - DEPRECATED for auto-assign
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
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    if (!user.branch) {
      console.warn(`Staff ${user.email} has no branch assigned.`);
      return res.status(200).json([]);
    }

    const orders = await prisma.order.findMany({
      where: {
        branchName: user.branch,
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('getStaffOrders error:', error);
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

    if (!['APPROVED', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { 
        status,
        // Ensure it's assigned to this staff if not already
        assignedTo: req.user.id 
      },
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

// @desc    Approve a pending order (STAFF)
// @route   PUT /api/staff/orders/:id/approve
// @access  Private/BRANCH_STAFF
const approveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.update({
      where: { id },
      data: { 
        status: 'APPROVED',
        assignedTo: req.user.id
      },
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error approving order', error: error.message });
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

// @desc    Get all orders for a vendor (VENDOR)
// @route   GET /api/orders/vendor
// @access  Private/VENDOR
const getVendorOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              vendorId: req.user.id,
            },
          },
        },
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          where: {
            product: {
              vendorId: req.user.id,
            },
          },
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor orders', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getBranchOrders,
  getVendorOrders,
  assignOrder,
  getStaffOrders,
  updateOrderStatus,
  approveOrder,
  getBranchStaff,
};
