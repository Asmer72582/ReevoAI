import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "../config/env.js";

export type GenerateContentInput = {
  type: string;
  tone: string;
  prompt: string;
  brandVoice?: string;
  reviewSnippets?: string[];
};

export type AiGenerateResult = {
  content: string;
  variations: string[];
  source: "gemini" | "fallback";
  model?: string;
  fallbackReason?: "quota_exceeded" | "api_error" | "no_key";
  imageUrl?: string;
  imageSource?: "gemini" | "poster";
};

/** Free-tier models (2026) — highest quota first. See ai.google.dev/pricing */
const FREE_TIER_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

function getModelChain(): string[] {
  const preferred = env.geminiModel;
  return [preferred, ...FREE_TIER_MODELS].filter((m, i, arr) => arr.indexOf(m) === i);
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; message?: string };
  return e.status === 429 || (e.message?.includes("429") ?? false) || (e.message?.includes("quota") ?? false);
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; message?: string };
  return e.status === 404 || (e.message?.includes("404") ?? false) || (e.message?.includes("not found") ?? false);
}

async function callGeminiText(prompt: string): Promise<{ text: string; model: string } | null> {
  if (!env.geminiApiKey) return null;

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  let sawQuotaError = false;

  for (const modelName of getModelChain()) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = result.response.text().trim();
      if (text) {
        console.log(`Gemini OK: ${modelName}`);
        return { text, model: modelName };
      }
    } catch (error) {
      if (isQuotaError(error)) {
        sawQuotaError = true;
        console.warn(`Gemini quota on ${modelName} — trying next free model…`);
        continue;
      }
      if (isNotFoundError(error)) {
        console.warn(`Gemini model unavailable: ${modelName}`);
        continue;
      }
      console.warn(`Gemini error on ${modelName}:`, (error as Error).message ?? error);
    }
  }

  if (sawQuotaError) {
    console.warn("All free Gemini models quota-limited — using local templates");
  }

  return null;
}

export async function generateMarketingContent(input: GenerateContentInput): Promise<AiGenerateResult> {
  const systemContext = [
    `Format: ${input.type}`,
    `Tone: ${input.tone}`,
    input.brandVoice ? `Brand voice: ${input.brandVoice}` : "",
    input.reviewSnippets?.length
      ? `Customer reviews to reference:\n${input.reviewSnippets.map((r) => `- ${r}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = `${input.prompt}\n\nWrite ready-to-post social content. Include relevant hashtags when appropriate.`;
  const fullPrompt = `${systemContext}\n\nTask: ${userPrompt}\n\nReturn exactly 3 variations separated by "---VARIATION---". No other preamble.`;

  if (!env.geminiApiKey) {
    const fallback = buildFallbackContent(input);
    return { content: fallback[0], variations: fallback, source: "fallback", fallbackReason: "no_key" };
  }

  const gemini = await callGeminiText(fullPrompt);
  if (gemini) {
    const parts = gemini.text
      .split("---VARIATION---")
      .map((p) => p.trim())
      .filter(Boolean);
    const variations = parts.length >= 1 ? parts : [gemini.text];
    return { content: variations[0], variations, source: "gemini", model: gemini.model };
  }

  const fallback = buildFallbackContent(input);
  return {
    content: fallback[0],
    variations: fallback,
    source: "fallback",
    fallbackReason: "quota_exceeded",
  };
}

function buildFallbackContent(input: GenerateContentInput): string[] {
  const snippet =
    input.reviewSnippets?.[0] ??
    "Best onboarding I've ever experienced — the team replies in minutes.";
  return [
    `✨ ${input.tone} ${input.type}: "${snippet}"\n\nThat's the bar. ⚡\n\n#CustomerLove #SaaS #ReevoAI`,
    `We turned real customer wins into ${input.type} content — automatically.\n\n${input.prompt}\n\n🚀 #ReevoAI`,
    `${input.tone} take: ${input.prompt}\n\n"${snippet}"\n\nYour customers are your best marketers.`,
  ];
}

export type ReviewPostInput = {
  name: string;
  text: string;
  stars: number;
  brandName?: string;
  brandVoice?: string;
  hashtags?: string;
};

export async function generateReviewPostCaption(
  input: ReviewPostInput,
): Promise<{ title: string; content: string; source: "gemini" | "fallback" }> {
  const stars = "★".repeat(input.stars);
  const tags = input.hashtags?.trim() || "#CustomerLove #Testimonial #ReevoAI";
  const prompt = `Create an Instagram-ready social post from this customer review.

Brand: ${input.brandName ?? "ReevoAI"}
Brand voice: ${input.brandVoice ?? "warm, authentic, celebratory"}
Reviewer: ${input.name}
Rating: ${input.stars}/5 (${stars})
Review: "${input.text}"
Suggested hashtags: ${tags}

Write:
1. A short punchy title (max 60 chars) for internal use — no quotes.
2. A full caption (2-4 sentences, friendly emojis, attribute the reviewer by first name, end with hashtags).

Format your response EXACTLY as:
TITLE: ...
CAPTION: ...`;

  if (!env.geminiApiKey) {
    return buildReviewPostFallback(input);
  }

  const gemini = await callGeminiText(prompt);
  if (gemini) {
    const titleMatch = gemini.text.match(/TITLE:\s*(.+)/i);
    const captionMatch = gemini.text.match(/CAPTION:\s*([\s\S]+)/i);
    const title = titleMatch?.[1]?.trim() ?? `${input.name}'s ${input.stars}★ review`;
    const content = captionMatch?.[1]?.trim() ?? gemini.text.trim();
    return { title, content, source: "gemini" };
  }

  return buildReviewPostFallback(input);
}

function buildReviewPostFallback(input: ReviewPostInput): {
  title: string;
  content: string;
  source: "fallback";
} {
  const firstName = input.name.split(" ")[0];
  const tags = input.hashtags?.trim() || "#CustomerLove #Testimonial #ReevoAI";
  return {
    title: `${firstName}'s ${input.stars}★ review`,
    content: `We love hearing from customers like ${firstName}! ✨\n\n"${input.text}"\n\nThank you for the ${input.stars}-star love — stories like this keep us going. 🙌\n\n${tags}`,
    source: "fallback",
  };
}

export async function generateReelScript(input: {
  name: string;
  text: string;
  stars: number;
  brandName: string;
  brandVoice?: string;
}): Promise<{ script: string; source: "gemini" | "fallback" }> {
  const prompt = `Write a short Instagram Reel voiceover script (max 45 words) from this customer review.
Brand: ${input.brandName}
Voice: ${input.brandVoice ?? "warm, upbeat"}
Reviewer: ${input.name} (${input.stars}/5 stars)
Review: "${input.text}"
Return ONLY the spoken script text — no labels, no hashtags.`;

  if (!env.geminiApiKey) {
    return { script: buildReelScriptFallback(input), source: "fallback" };
  }

  const gemini = await callGeminiText(prompt);
  if (gemini?.text) {
    return { script: gemini.text.trim(), source: "gemini" };
  }

  return { script: buildReelScriptFallback(input), source: "fallback" };
}

function buildReelScriptFallback(input: {
  name: string;
  text: string;
  stars: number;
  brandName: string;
}): string {
  const first = input.name.split(" ")[0];
  return `Hear it from ${first}! "${input.text}" — another ${input.stars}-star win for ${input.brandName}. Real customers, real results.`;
}

export async function generateReviewReply(
  reviewText: string,
  brandVoice?: string,
): Promise<{ reply: string; source: "gemini" | "fallback" }> {
  const prompt = `Write a short, warm public reply to this customer review. Brand voice: ${brandVoice ?? "friendly and professional"}.\n\nReview: "${reviewText}"\n\nReply only with the message text.`;

  if (!env.geminiApiKey) {
    return {
      reply: `Thank you so much for sharing your experience! We're thrilled this resonated with you and we'll keep delivering the same level of care.`,
      source: "fallback",
    };
  }

  const gemini = await callGeminiText(prompt);
  if (gemini) {
    return { reply: gemini.text, source: "gemini" };
  }

  return {
    reply: `Thank you so much for sharing your experience! We're thrilled this resonated with you and we'll keep delivering the same level of care.`,
    source: "fallback",
  };
}
