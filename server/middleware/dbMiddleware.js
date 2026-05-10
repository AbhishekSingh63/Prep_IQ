/**
 * dbMiddleware.js
 *
 * Ensures MongoDB is connected before any route handler runs.
 * On Vercel, each invocation calls connectDB() which either reuses
 * the cached connection (fast) or creates a new one (cold start, ~1-3s).
 *
 * If the connection fails completely, responds with 503 Service Unavailable
 * so the client receives a meaningful error instead of a Mongoose buffer timeout.
 */

import { connectDB, getDBStatus } from '../lib/db.js';

export async function requireDB(req, res, next) {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[dbMiddleware] DB connection failed:', err.message);
    res.status(503).json({
      message: 'Database is temporarily unavailable. Please try again in a moment.',
      db: getDBStatus(),
    });
  }
}
