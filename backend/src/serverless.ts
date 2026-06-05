import type { Express } from "express";

import { createApp } from "./app.js";
import { connectDatabase } from "./db/connection.js";
import { initCloudinary } from "./lib/cloudinary.js";
import { ensureReviewLinks, seedDemoData } from "./services/seed.service.js";

let app: Express | null = null;
let initPromise: Promise<Express> | null = null;

export async function getServerlessApp(): Promise<Express> {
  if (app) return app;
  if (!initPromise) {
    initPromise = (async () => {
      await connectDatabase();
      initCloudinary();
      await seedDemoData();
      await ensureReviewLinks();
      app = createApp();
      return app;
    })();
  }
  return initPromise;
}
