import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import authRoutes from './routes/auth.routes.js';
import chickenRoutes from './routes/chicken.routes.js';
import fatherRoutes from './routes/father.routes.js';
import motherRoutes from './routes/mother.routes.js';
import chickRoutes from './routes/chick.routes.js';
import breedingBatchRoutes from './routes/breedingBatch.routes.js';
import statisticsRoutes from './routes/statistics.routes.js';
import vaccineRoutes from './routes/vaccine.routes.js';
import adminRoutes from './routes/admin.routes.js';
import promotionRoutes from './routes/promotion.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import vipBreedingRoutes from './routes/vipBreeding.routes.js';
import vipSubscriptionRoutes from './routes/vipSubscription.routes.js';
import { protect } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1. CORS should be the very first middleware so preflight OPTIONS requests are handled
// before they hit the rate limiter or helmet.
app.use(cors());

// 2. Standard Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Security Middlewares
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 5000, // Much higher limit for dev
  standardHeaders: true, 
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes'
    });
  }
});
app.use('/api/', apiLimiter);

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/chickens', chickenRoutes);
app.use('/api/fathers', fatherRoutes);
app.use('/api/mothers', motherRoutes);
app.use('/api/chicks', chickRoutes);
app.use('/api/breeding-batches', breedingBatchRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/vaccines', vaccineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/vip-breeding', vipBreedingRoutes);
app.use('/api/vip-subscriptions', vipSubscriptionRoutes);

// Simple Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is up and running!' });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
