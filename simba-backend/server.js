const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./src/config/db');
const { ensureCatalogSeeded } = require('./src/services/bootstrapService');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const branchRoutes = require('./src/routes/branchRoutes');
const aiSearchRoutes = require('./src/routes/aiSearchRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/ai-search', aiSearchRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const startServer = async () => {
  try {
    await connectDB();

    const bootstrapResult = await ensureCatalogSeeded();
    if (bootstrapResult.seeded) {
      console.log(`Seeded ${bootstrapResult.productCount} products into an empty database.`);
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server runs on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using it.`);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
