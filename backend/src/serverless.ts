import type { Express } from "express";

import { createApp } from "./app.js";
import { connectDatabase } from "./db/connection.js";
import { initCloudinary } from "./lib/cloudinary.js";
import { ensureReviewLinks, seedDemoData } from "./services/seed.service.js";

let app: Express | null = null;
let initPromise: Promise<Express> | null = null;

function assertVercelEnv(): void {
  if (!process.env.VERCEL) return;
  if (!process.env.MONGODB_URI?.trim()) {
    throw new Error("MONGODB_URI is not set. Add it in Vercel → Settings → Environment Variables.");
  }
}

export async function getServerlessApp(): Promise<Express> {
  if (app) return app;
  if (!initPromise) {
    initPromise = (async () => {
      assertVercelEnv();
      await connectDatabase();
      initCloudinary();
      try {
        await seedDemoData();
        await ensureReviewLinks();
      } catch (err) {
        console.error("Seed skipped:", err);
      }
      app = createApp();
      return app;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}
