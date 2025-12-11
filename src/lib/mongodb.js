import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/orbitos';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // Keep connection fast-failing in dev to avoid UI hangs
    const isDev = process.env.NODE_ENV !== 'production';
    const connectOptions = {
      serverSelectionTimeoutMS: isDev ? 2000 : 5000,
      socketTimeoutMS: isDev ? 2000 : 10000,
      family: 4,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, connectOptions)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
