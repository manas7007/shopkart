import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';

// Import Routes
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Serve static frontend build if present (Unified Production Mode)
const frontendDist = path.resolve(__dirname, '../frontend/dist');
const altFrontendDist = path.resolve(__dirname, '../../frontend/dist');
const distPath = fs.existsSync(frontendDist)
  ? frontendDist
  : fs.existsSync(altFrontendDist)
  ? altFrontendDist
  : null;

if (distPath) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/customers') ||
      req.path.startsWith('/products') ||
      req.path.startsWith('/wishlist') ||
      req.path.startsWith('/cart') ||
      req.path.startsWith('/orders')
    ) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Root Health Check Route when running API-only mode
  app.get('/', (req, res) => {
    res.json({
      success: true,
      service: 'ShopKart API Service',
      status: 'online',
      timestamp: new Date().toISOString(),
    });
  });
}

// 404 Route Handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ShopKart Server running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - Auth & Customers: http://localhost:${PORT}/customers`);
  console.log(`   - Product Catalog:  http://localhost:${PORT}/products`);
  console.log(`   - Wishlist:         http://localhost:${PORT}/wishlist`);
  console.log(`   - Cart:             http://localhost:${PORT}/cart`);
  console.log(`   - Orders:           http://localhost:${PORT}/orders`);
});

export default app;
