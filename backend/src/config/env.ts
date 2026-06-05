import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");
const projectRoot = path.resolve(backendRoot, "..");

dotenv.config({ path: path.join(backendRoot, ".env") });
dotenv.config({ path: path.join(projectRoot, ".env") });

function normalizeMongoUri(uri: string): string {
  if (!uri.startsWith("mongodb+srv://")) return uri;
  const [base, query = ""] = uri.split("?");
  const trimmed = base.replace(/\/$/, "");
  // host ends with .net and no database segment → use reevoai
  if (/\.mongodb\.net$/.test(trimmed)) {
    return `${trimmed}/reevoai${query ? `?${query}` : ""}`;
  }
  return uri;
}

export const env = {
  mongodbUri: normalizeMongoUri(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/reevoai"),
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
  jwtSecret: process.env.JWT_SECRET ?? "reevoai-dev-secret-change-in-production",
  apiPort: Number(process.env.API_PORT ?? 3001),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  publicAppUrl: process.env.PUBLIC_APP_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  apiPublicUrl: process.env.API_PUBLIC_URL ?? `http://127.0.0.1:${process.env.API_PORT ?? "3001"}`,
  nodeEnv: process.env.NODE_ENV ?? "development",
};
