const { prisma } = require('../config/db');

// @desc    Update stock for a product at staff's branch
// @route   PUT /api/branch/stock/:productId
// @access  Private/BRANCH_STAFF
const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;
    const branchName = req.user.branch;

    if (!branchName) {
      return res.status(400).json({ message: 'User is not assigned to a branch' });
    }

    const updatedStock = await prisma.branchStock.upsert({
      where: {
        productId_branchName: {
          productId,
          branchName
        }
      },
      update: { stock: parseInt(stock) },
      create: {
        productId,
        branchName,
        stock: parseInt(stock)
      }
    });

    res.status(200).json(updatedStock);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};

// @desc    Mark product as out of stock at staff's branch
// @route   PUT /api/branch/stock/:productId/out
// @access  Private/BRANCH_STAFF
const markOutOfStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const branchName = req.user.branch;

    if (!branchName) {
      return res.status(400).json({ message: 'User is not assigned to a branch' });
    }

    const updatedStock = await prisma.branchStock.upsert({
      where: {
        productId_branchName: {
          productId,
          branchName
        }
      },
      update: { stock: 0 },
      create: {
        productId,
        branchName,
        stock: 0
      }
    });

    res.status(200).json(updatedStock);
  } catch (error) {
    res.status(500).json({ message: 'Error marking out of stock', error: error.message });
  }
};

module.exports = {
  updateStock,
  markOutOfStock,
};
