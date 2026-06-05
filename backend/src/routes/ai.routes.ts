import { Router } from "express";
import { z } from "zod";

import { type AuthedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { Review } from "../models/Review.js";
import { WorkspaceSettings } from "../models/WorkspaceSettings.js";
import { tryGenerateGeminiImage } from "../services/gemini-image.service.js";
import { generateMarketingContent } from "../services/gemini.service.js";
import { generatePosterImage } from "../services/poster.service.js";
import { toObjectId } from "../utils/objectId.js";

export const aiRouter = Router();

aiRouter.post("/ai/generate", requireAuth, async (req: AuthedRequest, res) => {
  const body = z
    .object({
      type: z.string(),
      tone: z.string(),
      prompt: z.string().min(1),
    })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: body.error.flatten() });
    return;
  }

  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  const settings = await WorkspaceSettings.findOne({ userId });
  const topReviews = await Review.find({ userId, source: "Review Link", stars: { $gte: 4 } })
    .sort({ createdAt: -1 })
    .limit(3);

  const snippets = topReviews.map((r) => `${r.name}: ${r.text}`);

  const result = await generateMarketingContent({
    ...body.data,
    brandVoice: settings?.brandVoice,
    reviewSnippets: snippets,
  });

  const brandName = settings?.brandName ?? "ReevoAI";
  const imageInput = {
    content: result.content,
    brandName,
    type: body.data.type,
    tone: body.data.tone,
    prompt: body.data.prompt,
    hashtags: settings?.defaultHashtags,
  };

  let imageUrl: string | undefined;
  let imageSource: "gemini" | "poster" | undefined;

  const geminiImage = await tryGenerateGeminiImage(imageInput);
  if (geminiImage) {
    imageUrl = geminiImage;
    imageSource = "gemini";
  } else {
    imageUrl = await generatePosterImage(imageInput);
    imageSource = "poster";
  }

  res.json({ ...result, imageUrl, imageSource });
});
