import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { isCloudinaryConfigured } from "./lib/cloudinary.js";
import { apiRouter } from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_UPLOADS_DIR = path.resolve(__dirname, "../uploads");

function isDevOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function isVercelOrigin(origin: string): boolean {
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true;
  if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) return true;
  return false;
}

/** Serve legacy local uploads only for records created before Cloudinary migration. */
function mountLegacyUploads(app: express.Express, route: string, subdir: string) {
  const dir = path.join(LEGACY_UPLOADS_DIR, subdir);
  if (fs.existsSync(dir)) {
    app.use(route, express.static(dir));
  }
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (env.nodeEnv === "development" && isDevOrigin(origin)) {
          callback(null, true);
          return;
        }
        const allowed = [
          env.clientOrigin,
          env.publicAppUrl,
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:8080",
          "http://127.0.0.1:8080",
        ];
        if (!origin || allowed.includes(origin) || isVercelOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  mountLegacyUploads(app, "/uploads/reviews", "reviews");
  mountLegacyUploads(app, "/uploads/posters", "posters");
  mountLegacyUploads(app, "/uploads/reels", "reels");

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      mongodb: mongoose.connection.readyState === 1,
      gemini: Boolean(env.geminiApiKey),
      cloudinary: isCloudinaryConfigured(),
    });
  });

  app.use("/api", apiRouter);

  return app;
}
