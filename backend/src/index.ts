import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
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
import { protect } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chickens', chickenRoutes);
app.use('/api/fathers', fatherRoutes);
app.use('/api/mothers', motherRoutes);
app.use('/api/chicks', chickRoutes);
app.use('/api/breeding-batches', breedingBatchRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/vaccines', vaccineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promotions', promotionRoutes);

// Simple Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is up and running!' });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
