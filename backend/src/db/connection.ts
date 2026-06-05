import mongoose from "mongoose";

import { env } from "../config/env.js";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & { mongooseCache?: MongooseCache };

function getCache(): MongooseCache {
  if (!globalCache.mongooseCache) {
    globalCache.mongooseCache = { conn: null, promise: null };
  }
  return globalCache.mongooseCache;
}

export async function connectDatabase(): Promise<void> {
  const cache = getCache();
  if (cache.conn) return;

  mongoose.set("strictQuery", true);

  if (!cache.promise) {
    cache.promise = mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
    });
  }

  cache.conn = await cache.promise;
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
