import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

import sharp from "sharp";

import { fetchImageBuffer } from "../lib/cloudinary.js";
import { storeVideoFile } from "../lib/media-storage.js";
import type { ReviewDocument } from "../models/Review.js";
import { generateReelScript } from "./gemini.service.js";

const execFileAsync = promisify(execFile);

const W = 1080;
const H = 1920;
const SECONDS_PER_SCENE = 2;

export type ReelResult = {
  videoUrl: string;
  script: string;
  aiSource: "gemini" | "fallback";
};

type ReelContext = {
  brandName: string;
  brandVoice?: string;
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.slice(0, maxLines);
}

async function renderSvgFrame(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function renderPhotoFrame(photoBuffer: Buffer, overlaySvg: string): Promise<Buffer> {
  const base = await sharp(photoBuffer).resize(W, H, { fit: "cover" }).toBuffer();
  const overlay = await sharp(Buffer.from(overlaySvg)).png().toBuffer();
  return sharp(base).composite([{ input: overlay, top: 0, left: 0 }]).png().toBuffer();
}

function sceneReviewSvg(review: ReviewDocument, ctx: ReelContext): string {
  const quote = wrapLines(`"${review.text}"`, 28, 5);
  const stars = "★".repeat(review.stars);
  const name = escapeXml(review.name.split(" ")[0]);
  const brand = escapeXml(ctx.brandName);
  const lineEls = quote
    .map((line, i) => {
      const y = 920 + i * 56;
      return `<text x="540" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="600" fill="white">${escapeXml(line)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fa709a"/>
      <stop offset="50%" style="stop-color:#fee140"/>
      <stop offset="100%" style="stop-color:#f5576c"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" style="stop-color:rgba(0,0,0,0.1)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.75)"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <text x="540" y="120" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="white" opacity="0.9">CUSTOMER REVIEW</text>
  <text x="540" y="780" text-anchor="middle" font-size="48" fill="#fbbf24">${stars}</text>
  ${lineEls}
  <text x="540" y="1280" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="white" opacity="0.9">— ${name}</text>
  <text x="540" y="1820" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="white" opacity="0.6">${brand}</text>
</svg>`;
}

function sceneScriptSvg(script: string, ctx: ReelContext): string {
  const lines = wrapLines(script, 32, 8);
  const brand = escapeXml(ctx.brandName);
  const lineEls = lines
    .map((line, i) => {
      const y = 680 + i * 52;
      return `<text x="540" y="${y}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36" fill="white">${escapeXml(line)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4facfe"/>
      <stop offset="100%" style="stop-color:#667eea"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="540" y="140" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="white" opacity="0.9">AI SCRIPT</text>
  <rect x="290" y="200" width="500" height="56" rx="28" fill="white" opacity="0.15"/>
  <text x="540" y="238" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="white">Voiceover ready</text>
  ${lineEls}
  <text x="540" y="1820" text-anchor="middle" font-size="22" fill="white" opacity="0.6">${brand}</text>
</svg>`;
}

function sceneAvatarSvg(review: ReviewDocument, ctx: ReelContext): string {
  const initials = escapeXml(review.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase());
  const first = escapeXml(review.name.split(" ")[0]);
  const brand = escapeXml(ctx.brandName);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a18cd1"/>
      <stop offset="100%" style="stop-color:#fbc2eb"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="540" y="140" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="white" opacity="0.9">AI AVATAR</text>
  <circle cx="540" cy="720" r="160" fill="white" opacity="0.2"/>
  <circle cx="540" cy="720" r="130" fill="url(#bg)" stroke="white" stroke-width="6"/>
  <text x="540" y="745" text-anchor="middle" font-family="system-ui,sans-serif" font-size="72" font-weight="700" fill="white">${initials}</text>
  <text x="540" y="980" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36" font-weight="600" fill="white">Narrated by AI</text>
  <text x="540" y="1040" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="white" opacity="0.85">Delivering ${first}'s story</text>
  <text x="540" y="1820" text-anchor="middle" font-size="22" fill="white" opacity="0.6">${brand}</text>
</svg>`;
}

function sceneFinalSvg(script: string, ctx: ReelContext): string {
  const hook = wrapLines(extractHook(script), 30, 3);
  const brand = escapeXml(ctx.brandName);
  const lineEls = hook
    .map((line, i) => {
      const y = 1000 + i * 50;
      return `<text x="540" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="38" font-weight="600" fill="white">${escapeXml(line)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#11998e"/>
      <stop offset="100%" style="stop-color:#38ef7d"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="55%" style="stop-color:rgba(0,0,0,0)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.65)"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <text x="540" y="140" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="white">GENERATED REEL</text>
  <circle cx="540" cy="560" r="70" fill="white" opacity="0.25"/>
  <polygon points="520,520 520,600 590,560" fill="white"/>
  ${lineEls}
  <text x="540" y="1820" text-anchor="middle" font-size="22" fill="white" opacity="0.6">${brand}</text>
</svg>`;
}

function extractHook(script: string): string {
  const first = script.split(/[.!?\n]/)[0]?.trim() ?? script;
  return first.length <= 100 ? first : first.slice(0, 97) + "…";
}

async function buildSceneFrames(
  review: ReviewDocument,
  script: string,
  ctx: ReelContext,
): Promise<Buffer[]> {
  const photo = review.images?.[0];
  const photoBuffer = photo ? await fetchImageBuffer(photo) : null;

  const reviewOverlay = sceneReviewSvg(review, ctx);
  const frame1 =
    photoBuffer
      ? await renderPhotoFrame(photoBuffer, reviewOverlay)
      : await renderSvgFrame(reviewOverlay);

  const frame2 = await renderSvgFrame(sceneScriptSvg(script, ctx));
  const frame3 = await renderSvgFrame(sceneAvatarSvg(review, ctx));

  const finalOverlay = sceneFinalSvg(script, ctx);
  const frame4 =
    photoBuffer
      ? await renderPhotoFrame(photoBuffer, finalOverlay)
      : await renderSvgFrame(finalOverlay);

  return [frame1, frame2, frame3, frame4];
}

async function getFfmpegPath(): Promise<string | null> {
  try {
    const mod = await import("ffmpeg-static");
    return mod.default ?? null;
  } catch {
    return null;
  }
}

async function encodeMp4(frameBuffers: Buffer[], outputPath: string): Promise<void> {
  const ffmpeg = await getFfmpegPath();
  if (!ffmpeg) {
    throw new Error("Reel video encoding is not available on this host (ffmpeg missing)");
  }

  const tempDir = path.join(os.tmpdir(), `reevoai-reel-${randomUUID()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    frameBuffers.forEach((buf, i) => {
      const name = `frame_${String(i + 1).padStart(3, "0")}.png`;
      fs.writeFileSync(path.join(tempDir, name), buf);
    });

    const inputPattern = path.join(tempDir, "frame_%03d.png");
    const fps = 1 / SECONDS_PER_SCENE;

    await execFileAsync(ffmpeg, [
      "-y",
      "-framerate",
      String(fps),
      "-i",
      inputPattern,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-r",
      "30",
      outputPath,
    ]);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

export async function generateReviewReel(
  review: ReviewDocument,
  ctx: ReelContext,
): Promise<ReelResult> {
  const scriptResult = await generateReelScript({
    name: review.name,
    text: review.text,
    stars: review.stars,
    brandName: ctx.brandName,
    brandVoice: ctx.brandVoice,
  });

  const script = scriptResult.script;
  const frames = await buildSceneFrames(review, script, ctx);

  const tempVideo = path.join(os.tmpdir(), `reevoai-reel-${randomUUID()}.mp4`);
  try {
    await encodeMp4(frames, tempVideo);
    const videoUrl = await storeVideoFile(tempVideo);

    return {
      videoUrl,
      script,
      aiSource: scriptResult.source,
    };
  } finally {
    if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
  }
}
