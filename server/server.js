import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// ─── Startup Validation ───────────────────────────────────────────────────────
// Fail loudly at startup so Vercel deployment logs show the exact missing var
// instead of a cryptic runtime crash later.
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'ANTHROPIC_API_KEY'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `[server] FATAL: Missing required environment variables: ${missing.join(', ')}\n` +
    'Add them to your Vercel project → Settings → Environment Variables.'
  );
  process.exit(1);
}

import express from 'express';
import cors from 'cors';

import interviewRoutes from './routes/interviewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { requireDB } from './middleware/dbMiddleware.js';
import { connectDB, getDBStatus } from './lib/db.js';
import { protect } from './middleware/authMiddleware.js';

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
// Called by the client before login to detect cold-start / DB outage.
// Returns 200 when healthy, 503 when the DB can't be reached.
app.get('/api/health', async (_req, res) => {
  try {
    await connectDB();
    res.json({ status: 'ok', db: getDBStatus() });
  } catch {
    res.status(503).json({ status: 'degraded', db: getDBStatus() });
  }
});

// ─── Basic ping (Vercel deployment check) ─────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ message: 'Prep IQ API is running', db: getDBStatus() });
});

// ─── Routes (all protected by DB readiness middleware) ────────────────────────
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/history', requireDB, historyRoutes);
app.use('/api/interview', interviewRoutes);   // interview routes call external AI, no DB read needed at entry
app.use('/api/user', requireDB, userRoutes);

// ─── Error Middleware ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server (local dev only — Vercel ignores this) ──────────────────────
app.listen(PORT, () => {
  console.log(`[server] Running on port ${PORT}`);
  // Eagerly connect on startup in local dev so the first request is fast
  connectDB().catch(() => {});
});

export default app;