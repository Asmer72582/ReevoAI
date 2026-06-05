import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "../config/env.js";
import { storeImageBuffer } from "../lib/media-storage.js";

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
          const format = inline.mimeType.includes("png") ? "png" : "jpg";
          const buffer = Buffer.from(inline.data, "base64");
          console.log(`Gemini image OK: ${modelName}`);
          return storeImageBuffer(buffer, "posters", format);
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
