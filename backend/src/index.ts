import { env } from "./config/env.js";
import { connectDatabase } from "./db/connection.js";
import { createApp } from "./app.js";
import { ensureReviewLinks, seedDemoData } from "./services/seed.service.js";

async function main() {
  await connectDatabase();
  await seedDemoData();
  await ensureReviewLinks();

  const app = createApp();

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
