import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import sharp from "sharp";

import { env } from "../config/env.js";
import { UPLOADS_DIR } from "../lib/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTERS_DIR = path.resolve(__dirname, "../../uploads/posters");

if (!fs.existsSync(POSTERS_DIR)) {
  fs.mkdirSync(POSTERS_DIR, { recursive: true });
}

export type PosterInput = {
  content: string;
  brandName: string;
  type: string;
  tone: string;
  hashtags?: string;
};

const GRADIENTS: Record<string, [string, string, string]> = {
  caption: ["#667eea", "#764ba2", "#f093fb"],
  carousel: ["#4facfe", "#00f2fe", "#43e97b"],
  reel: ["#fa709a", "#fee140", "#f5576c"],
  quote: ["#a18cd1", "#fbc2eb", "#8fd3f4"],
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractHeadline(content: string): string {
  const noTags = content.replace(/#\w+/g, "").trim();
  const first = noTags.split(/[.!?\n]/)[0]?.trim() ?? noTags;
  if (first.length <= 140) return first;
  return first.slice(0, 137) + "…";
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

function buildSvg(input: PosterInput): string {
  const [c1, c2, c3] = GRADIENTS[input.type] ?? GRADIENTS.caption;
  const headline = extractHeadline(input.content);
  const lines = wrapLines(headline, 28, 5);
  const brand = escapeXml(input.brandName);
  const typeLabel = escapeXml(input.type.toUpperCase());
  const toneLabel = escapeXml(input.tone);
  const tags = escapeXml((input.hashtags ?? "#CustomerLove #ReevoAI").slice(0, 60));

  const lineEls = lines
    .map((line, i) => {
      const y = 420 + i * 52;
      return `<text x="540" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="600" fill="white">${escapeXml(line)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="50%" style="stop-color:${c2}"/>
      <stop offset="100%" style="stop-color:${c3}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <circle cx="180" cy="180" r="280" fill="white" opacity="0.08"/>
  <circle cx="920" cy="900" r="320" fill="white" opacity="0.06"/>
  <text x="540" y="120" text-anchor="middle" font-family="system-ui, sans-serif" font-size="36" font-weight="700" fill="white" opacity="0.95">${brand}</text>
  <rect x="390" y="155" width="300" height="44" rx="22" fill="white" opacity="0.2"/>
  <text x="540" y="186" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="white">${typeLabel} · ${toneLabel}</text>
  <text x="540" y="340" text-anchor="middle" font-size="64" fill="white" opacity="0.9">★★★★★</text>
  <g filter="url(#shadow)">
    ${lineEls}
  </g>
  <text x="540" y="780" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" fill="white" opacity="0.85">— Customer testimonial</text>
  <text x="540" y="980" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="white" opacity="0.7">${tags}</text>
</svg>`;
}

export async function generatePosterImage(input: PosterInput): Promise<string> {
  const svg = buildSvg(input);
  const filename = `${randomUUID()}.png`;
  const filepath = path.join(POSTERS_DIR, filename);

  await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(filepath);

  return `${env.apiPublicUrl}/uploads/posters/${filename}`;
}

export type ReviewPhotoPosterInput = PosterInput & {
  reviewerName: string;
  stars: number;
  photoUrl: string;
  reviewText: string;
};

function reviewPhotoUrlToPath(url: string): string | null {
  const marker = "/uploads/reviews/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return path.join(UPLOADS_DIR, url.slice(idx + marker.length));
}

function buildPhotoOverlaySvg(input: ReviewPhotoPosterInput): string {
  const quote = input.reviewText.trim() || extractHeadline(input.content);
  const lines = wrapLines(`"${quote}"`, 30, 4);
  const brand = escapeXml(input.brandName);
  const reviewer = escapeXml(input.reviewerName.split(" ")[0]);
  const starStr = "★".repeat(Math.min(5, Math.max(1, input.stars)));

  const lineEls = lines
    .map((line, i) => {
      const y = 780 + i * 42;
      return `<text x="540" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="600" fill="white">${escapeXml(line)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" style="stop-color:rgba(0,0,0,0);"/>
      <stop offset="45%" style="stop-color:rgba(0,0,0,0);"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.75)"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#fade)"/>
  <text x="540" y="720" text-anchor="middle" font-size="40" fill="#fbbf24">${starStr}</text>
  ${lineEls}
  <text x="540" y="1000" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" fill="white" opacity="0.9">— ${reviewer} · ${brand}</text>
</svg>`;
}

export async function generateReviewPhotoPoster(input: ReviewPhotoPosterInput): Promise<string | null> {
  const photoPath = reviewPhotoUrlToPath(input.photoUrl);
  if (!photoPath || !fs.existsSync(photoPath)) return null;

  const filename = `${randomUUID()}.png`;
  const filepath = path.join(POSTERS_DIR, filename);
  const overlaySvg = buildPhotoOverlaySvg(input);

  try {
    const base = await sharp(photoPath).resize(1080, 1080, { fit: "cover" }).toBuffer();
    const overlay = await sharp(Buffer.from(overlaySvg)).png().toBuffer();
    await sharp(base).composite([{ input: overlay, top: 0, left: 0 }]).png({ quality: 90 }).toFile(filepath);
    return `${env.apiPublicUrl}/uploads/posters/${filename}`;
  } catch (error) {
    console.warn("Review photo poster failed:", (error as Error).message);
    return null;
  }
}
