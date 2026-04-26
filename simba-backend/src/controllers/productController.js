const { prisma } = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { branch } = req.query;

    let include = {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };

    // If branch is provided, include stock for that branch
    if (branch) {
      include.stocks = {
        where: {
          branchName: branch
        }
      };
    }

    const products = await prisma.product.findMany({
      include
    });

    // Flatten stocks for convenience if branch was requested
    const formattedProducts = branch ? products.map(p => ({
      ...p,
      stock: p.stocks[0]?.stock || 0
    })) : products;

    res.status(200).json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Vendor
const createProduct = async (req, res) => {
  try {
    const { name, price, category, image, description } = req.body;

    // Basic validation
    if (!name || !price || !category || !image) {
      return res.status(400).json({ message: 'Please provide name, price, category, and image' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        image,
        description,
        vendorId: req.user.id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Vendor
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, image, description } = req.body;

    // Find product and check ownership
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || product.name,
        price: price ? parseFloat(price) : product.price,
        category: category || product.category,
        image: image || product.image,
        description: description || product.description,
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Vendor
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product and check ownership
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.vendorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
