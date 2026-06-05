import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");
const projectRoot = path.resolve(backendRoot, "..");

dotenv.config({ path: path.join(projectRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, ".env"), override: true });
dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });

function envStr(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

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

function resolveAppOrigin(): string {
  if (process.env.CLIENT_ORIGIN?.trim()) return process.env.CLIENT_ORIGIN.trim();
  if (process.env.PUBLIC_APP_URL?.trim()) return process.env.PUBLIC_APP_URL.trim();
  if (process.env.VERCEL_URL?.trim()) return `https://${process.env.VERCEL_URL.trim()}`;
  return "http://localhost:5173";
}

const appOrigin = resolveAppOrigin();

export const env = {
  mongodbUri: normalizeMongoUri(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/reevoai"),
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
  jwtSecret: process.env.JWT_SECRET ?? "reevoai-dev-secret-change-in-production",
  apiPort: Number(process.env.API_PORT ?? 3001),
  clientOrigin: appOrigin,
  publicAppUrl: process.env.PUBLIC_APP_URL?.trim() ?? appOrigin,
  apiPublicUrl:
    process.env.API_PUBLIC_URL?.trim() ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : `http://127.0.0.1:${process.env.API_PORT ?? "3001"}`),
  nodeEnv: process.env.NODE_ENV ?? "development",
  cloudinaryCloudName: envStr("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: envStr("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: envStr("CLOUDINARY_API_SECRET"),
  cloudinaryUploadPreset: envStr("CLOUDINARY_UPLOAD_PRESET"),
};
