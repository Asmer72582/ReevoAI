import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { UPLOADS_DIR } from "./lib/upload.js";
import { apiRouter } from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTERS_DIR = path.resolve(__dirname, "../uploads/posters");
const REELS_DIR = path.resolve(__dirname, "../uploads/reels");
if (!fs.existsSync(REELS_DIR)) fs.mkdirSync(REELS_DIR, { recursive: true });

function isDevOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
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
        const allowed = [env.clientOrigin, "http://localhost:5173", "http://127.0.0.1:5173"];
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/uploads/reviews", express.static(UPLOADS_DIR));
  app.use("/uploads/posters", express.static(POSTERS_DIR));
  app.use("/uploads/reels", express.static(REELS_DIR));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      mongodb: mongoose.connection.readyState === 1,
      gemini: Boolean(env.geminiApiKey),
    });
  });

  app.use("/api", apiRouter);

  return app;
}
