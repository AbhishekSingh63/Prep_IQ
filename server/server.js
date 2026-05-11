import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import cors from 'cors';

import interviewRoutes from './routes/interviewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { requireDB } from './middleware/dbMiddleware.js';
import { connectDB, getDBStatus } from './lib/db.js';

// ─── Startup Validation ───────────────────────────────────────────────────────
// Log missing vars loudly but DON'T call process.exit() — on Vercel serverless,
// exiting kills the function instance before it can return a response.
// Routes that need DB/JWT will fail gracefully via their own middleware instead.
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ANTHROPIC_API_KEY'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `[server] WARNING: Missing environment variables: ${missing.join(', ')}. ` +
    'Add them in Vercel → Settings → Environment Variables and redeploy.'
  );
}

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://prep-iq.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// ─── Health Endpoint ──────────────────────────────────────────────────────────
// Vercel routes /api/* to this file, so Express sees the full path /api/health.
app.get('/api/health', async (_req, res) => {
  const envStatus = missing.length === 0
    ? 'ok'
    : `missing: ${missing.join(', ')}`;

  try {
    await connectDB();
    res.json({ status: 'ok', db: getDBStatus(), env: envStatus });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      db: getDBStatus(),
      env: envStatus,
      error: err.message,
    });
  }
});

// ─── Basic ping ───────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ message: 'Prep IQ API is running', db: getDBStatus() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/history', requireDB, historyRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', requireDB, userRoutes);

// ─── Error Middleware ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Local dev server ─────────────────────────────────────────────────────────
// Vercel ignores app.listen() — it imports `app` as a serverless handler instead.
app.listen(PORT, () => {
  console.log(`[server] Running on port ${PORT}`);
  connectDB().catch(() => {});
});

export default app;