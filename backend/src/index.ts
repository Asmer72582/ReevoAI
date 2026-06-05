import { env } from "./config/env.js";
import { connectDatabase } from "./db/connection.js";
import { createApp } from "./app.js";
import { initCloudinary, isCloudinaryConfigured } from "./lib/cloudinary.js";
import { ensureReviewLinks, seedDemoData } from "./services/seed.service.js";
import { v2 as cloudinary } from "cloudinary";

async function verifyCloudinary(): Promise<void> {
  initCloudinary();
  await cloudinary.api.ping();
}

async function main() {
  await connectDatabase();
  await seedDemoData();
  await ensureReviewLinks();

  const app = createApp();

  if (!isCloudinaryConfigured()) {
    console.error("Cloudinary not configured — image/video uploads will fail. Set CLOUDINARY_* in backend/.env");
  } else {
    try {
      await verifyCloudinary();
      console.log("Cloudinary  → connected (all media uploads go to Cloudinary)");
    } catch {
      console.error("Cloudinary  → credentials invalid — check CLOUDINARY_* in backend/.env");
    }
  }

  app.listen(env.apiPort, "0.0.0.0", () => {
    console.log(`ReevoAI API → http://127.0.0.1:${env.apiPort}`);
    console.log(`MongoDB   → ${env.mongodbUri}`);
    console.log(`Demo login: demo@reevoai.com / demo1234`);
    if (!env.geminiApiKey) {
      console.log("GEMINI_API_KEY not set — AI uses fallback templates");
    }
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
