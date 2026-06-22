const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./src/config/db');
const { ensureCatalogSeeded, seedAdminData } = require('./src/services/bootstrapService');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const branchRoutes = require('./src/routes/branchRoutes');
const aiSearchRoutes = require('./src/routes/aiSearchRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser/server requests (e.g., curl) when origin is undefined
    if (!origin) return callback(null, true);

    // Allow configured origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // During development, allow common local network origins so mobile devices on the LAN can reach the API
    const isLocalNetwork = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('http://192.') || origin.startsWith('http://10.') || origin.startsWith('http://172.');
    if (process.env.NODE_ENV !== 'production' && isLocalNetwork) return callback(null, true);

    // Otherwise block
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/ai-search', aiSearchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const startServer = async () => {
  try {
    await connectDB();

    await seedAdminData();
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
