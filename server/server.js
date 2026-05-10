import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import interviewRoutes from './routes/interviewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;


// Connect Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prep_ai')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://prep-iq.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server) or known origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', userRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Interview Preparation API is running' });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});