import "server-only";
import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalWithCache = globalThis as typeof globalThis & { _mongooseCache?: Cache };
const cache: Cache = (globalWithCache._mongooseCache ??= { conn: null, promise: null });

/** Cached connection (survives Next.js hot reloads and serverless warm starts). Server-only. */
export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
