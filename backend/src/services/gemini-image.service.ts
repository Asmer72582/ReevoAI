import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTERS_DIR = path.resolve(__dirname, "../../uploads/posters");

const IMAGE_MODELS = [
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.5-flash-image",
];

export type ImageGenInput = {
  content: string;
  brandName: string;
  type: string;
  tone: string;
  prompt: string;
};

export async function tryGenerateGeminiImage(input: ImageGenInput): Promise<string | null> {
  if (!env.geminiApiKey) return null;

  const imagePrompt = `Create a polished Instagram square post graphic (1080x1080 style).
Brand: ${input.brandName}
Format: ${input.type}
Tone: ${input.tone}
Brief: ${input.prompt}
Caption to visualize: ${input.content.slice(0, 400)}
Design: modern gradient background, bold readable quote text, social-media ready, professional marketing aesthetic. No watermarks.`;

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);

  for (const modelName of IMAGE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        // @ts-expect-error — image modality supported on preview models
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
      });

      const parts = result.response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        const inline = (part as { inlineData?: { mimeType?: string; data?: string } }).inlineData;
        if (inline?.data && inline.mimeType?.startsWith("image/")) {
          if (!fs.existsSync(POSTERS_DIR)) fs.mkdirSync(POSTERS_DIR, { recursive: true });
          const ext = inline.mimeType.includes("png") ? ".png" : ".jpg";
          const filename = `${randomUUID()}${ext}`;
          fs.writeFileSync(path.join(POSTERS_DIR, filename), Buffer.from(inline.data, "base64"));
          console.log(`Gemini image OK: ${modelName}`);
          return `${env.apiPublicUrl}/uploads/posters/${filename}`;
        }
      }
    } catch (error) {
      const msg = (error as Error).message ?? "";
      if (msg.includes("404") || msg.includes("not found")) {
        console.warn(`Gemini image model unavailable: ${modelName}`);
      } else if (msg.includes("429") || msg.includes("quota")) {
        console.warn(`Gemini image quota on ${modelName}`);
      } else {
        console.warn(`Gemini image failed (${modelName}):`, msg.slice(0, 120));
      }
    }
  }

  return null;
}
