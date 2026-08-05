import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    "Please define DATABASE_URL in .env.local (e.g. a MongoDB connection string)."
  );
}

/**
 * Cached connection across Next.js hot-reloads and serverless invocations.
 * https://mongoosejs.com/docs/lambda.html
 */
const globalForMongoose = globalThis;

let cached = globalForMongoose.mongooseCache;
if (!cached) {
  cached = globalForMongoose.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
