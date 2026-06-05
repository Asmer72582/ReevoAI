import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import { v2 as cloudinary } from "cloudinary";

import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_REVIEWS_DIR = path.resolve(__dirname, "../../uploads/reviews");

export const CLOUDINARY_FOLDERS = {
  reviews: "reevoai/reviews",
  posters: "reevoai/posters",
  reels: "reevoai/reels",
} as const;

export function isCloudinaryConfigured(): boolean {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
}

let configured = false;

function ensureConfigured(): void {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend/.env, then restart the API server.",
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: String(env.cloudinaryApiKey),
      api_secret: String(env.cloudinaryApiSecret),
      secure: true,
    });
    configured = true;
  }
}

/** Safe to call at startup — no-op when credentials are missing. */
export function initCloudinary(): void {
  if (!isCloudinaryConfigured()) return;
  ensureConfigured();
}

type UploadOptions = {
  folder: string;
  resourceType?: "image" | "video" | "raw";
  format?: string;
};

function uploadOptions(options: UploadOptions) {
  const opts: Record<string, string> = {
    folder: options.folder,
    resource_type: options.resourceType ?? "image",
  };
  // Signed uploads use API secret; only add preset when explicitly configured.
  if (env.cloudinaryUploadPreset) {
    opts.upload_preset = env.cloudinaryUploadPreset;
  }
  return opts;
}

export async function uploadBuffer(buffer: Buffer, options: UploadOptions): Promise<string> {
  ensureConfigured();

  const mime =
    options.format === "jpg" || options.format === "jpeg"
      ? "image/jpeg"
      : options.format === "webp"
        ? "image/webp"
        : options.format === "gif"
          ? "image/gif"
          : "image/png";

  const result = await cloudinary.uploader.upload(
    `data:${mime};base64,${buffer.toString("base64")}`,
    uploadOptions(options),
  );

  if (!result.secure_url) throw new Error("Cloudinary upload returned no URL");
  return result.secure_url;
}

export async function uploadFile(filePath: string, options: UploadOptions): Promise<string> {
  ensureConfigured();

  const result = await cloudinary.uploader.upload(filePath, uploadOptions(options));
  if (!result.secure_url) throw new Error("Cloudinary upload returned no URL");
  return result.secure_url;
}

function legacyReviewPath(url: string): string | null {
  const marker = "/uploads/reviews/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return path.join(LEGACY_REVIEWS_DIR, url.slice(idx + marker.length));
}

/** Load image bytes from a Cloudinary URL, remote URL, or legacy local review path. */
export async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  const localPath = legacyReviewPath(url);
  if (localPath && fs.existsSync(localPath)) {
    return fs.readFileSync(localPath);
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  return null;
}

function toOverlayId(publicId: string): string {
  return `image:${publicId.replace(/\//g, ":")}`;
}

/** Build an MP4 slideshow from PNG frames using Cloudinary (works on Vercel without ffmpeg). */
export async function createVideoFromFrameBuffers(
  frameBuffers: Buffer[],
  options: {
    folder: string;
    secondsPerScene: number;
    width: number;
    height: number;
  },
): Promise<string> {
  ensureConfigured();
  if (frameBuffers.length === 0) throw new Error("No frames to encode");

  const batchId = randomUUID();
  const publicIds: string[] = [];

  for (let i = 0; i < frameBuffers.length; i++) {
    const publicId = `${options.folder}/frames/${batchId}/f${String(i + 1).padStart(2, "0")}`;
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${frameBuffers[i].toString("base64")}`,
      {
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
      },
    );
    if (!result.public_id) throw new Error("Cloudinary frame upload failed");
    publicIds.push(result.public_id);
  }

  const duration = String(options.secondsPerScene);
  const transformation: Record<string, string | number>[] = [
    {
      duration,
      width: options.width,
      height: options.height,
      crop: "fill",
    },
  ];

  for (let i = 1; i < publicIds.length; i++) {
    transformation.push(
      { flags: "splice", overlay: toOverlayId(publicIds[i]), duration },
      { flags: "layer_apply" },
    );
  }

  const derivedUrl = cloudinary.url(publicIds[0], {
    resource_type: "video",
    format: "mp4",
    transformation,
    secure: true,
  });

  const video = await cloudinary.uploader.upload(derivedUrl, {
    resource_type: "video",
    folder: options.folder,
    format: "mp4",
    overwrite: true,
  });

  if (!video.secure_url) throw new Error("Cloudinary reel video upload failed");
  return video.secure_url;
}
