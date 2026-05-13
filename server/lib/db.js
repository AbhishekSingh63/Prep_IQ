/**
 * db.js — Cached Mongoose connection for Vercel serverless
 *
 * On Vercel, each API invocation may spin up a new Node.js instance.
 * Without caching, every request opens a new MongoDB connection, quickly
 * exhausting Atlas's connection pool (default 500) and causing cold-start
 * failures that surface as "Login failed. Please check your connection."
 *
 * This module caches the connection on the global object so warm function
 * instances reuse it instead of reconnecting on every request.
 */

import mongoose from 'mongoose';

// Use the global object to persist the cache across hot-reloads in dev
// and across invocations on the same warm Vercel instance in production.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const MONGOOSE_OPTS = {
  // Don't buffer Mongoose operations while disconnected — fail fast
  bufferCommands: false,

  // How long the driver waits to find an available server (ms)
  serverSelectionTimeoutMS: 10000,

  // How long a send/receive on the socket can take (ms)
  socketTimeoutMS: 45000,

  // Max connections in the pool — keep small for serverless
  maxPoolSize: 10,
  minPoolSize: 1,
};

/**
 * connectDB()
 * Returns a cached Mongoose connection, or creates a new one.
 * Safe to call on every request — subsequent calls are no-ops.
 */
export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error(
      '[db.js] MONGO_URI is not defined. Add it to Vercel → Settings → Environment Variables and redeploy.'
    );
  }

  // If we already have a live connection, return it immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is already in-flight, await it
  if (!cached.promise) {
    console.log('[db] Establishing new MongoDB connection...');
    cached.promise = mongoose.connect(MONGO_URI, MONGOOSE_OPTS)
      .then((m) => {
        console.log('[db] MongoDB connected successfully.');
        return m;
      })
      .catch((err) => {
        // Clear the promise so the next request can retry
        cached.promise = null;
        console.error('[db] MongoDB connection failed:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * getDBStatus()
 * Returns a human-readable string of the current Mongoose connection state.
 */
export function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] ?? 'unknown';
}
