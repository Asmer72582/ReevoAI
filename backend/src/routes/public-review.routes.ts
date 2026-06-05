import { Router } from "express";
import { z } from "zod";

import { storeImageBuffer } from "../lib/media-storage.js";
import { reviewImageFormat, reviewImageUpload } from "../lib/upload.js";
import { Review } from "../models/Review.js";
import { ReviewLink } from "../models/ReviewLink.js";
import { WorkspaceSettings } from "../models/WorkspaceSettings.js";
import { paramId } from "../utils/objectId.js";
import { createPostFromReview } from "../services/review-post.service.js";
import { analyzeReviewSentiment } from "../services/sentiment.service.js";
import { serializeReview } from "../utils/serializers.js";

export const publicReviewRouter = Router();

publicReviewRouter.get("/public/review/:token", async (req, res) => {
  const token = paramId(req.params.token);
  const link = await ReviewLink.findOne({ token, active: true });
  if (!link) {
    res.status(404).json({ error: "Review link not found or inactive" });
    return;
  }

  const settings = await WorkspaceSettings.findOne({ userId: link.userId });

  res.json({
    brandName: settings?.brandName ?? "ReevoAI",
    label: link.label,
    acceptsImages: true,
    maxImages: 5,
  });
});

publicReviewRouter.post(
  "/public/review/:token",
  (req, res, next) => {
    reviewImageUpload.array("images", 5)(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
        return;
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const token = paramId(req.params.token);
      const link = await ReviewLink.findOne({ token, active: true });
      if (!link) {
        res.status(404).json({ error: "Review link not found or inactive" });
        return;
      }

      const body = z
        .object({
          name: z.string().min(1).max(120),
          text: z.string().min(10).max(2000),
          stars: z.coerce.number().int().min(1).max(5),
        })
        .safeParse(req.body);

      if (!body.success) {
        res.status(400).json({ error: body.error.flatten() });
        return;
      }

      const files = req.files as Express.Multer.File[] | undefined;
      const imageUrls = await Promise.all(
        (files ?? []).map((f) => storeImageBuffer(f.buffer, "reviews", reviewImageFormat(f))),
      );

      const text = body.data.text.trim();
      const sentiment = analyzeReviewSentiment(text, body.data.stars);

      const review = await Review.create({
        userId: link.userId,
        name: body.data.name.trim(),
        text,
        stars: body.data.stars,
        source: "Review Link",
        tag: sentiment,
        images: imageUrls,
      });

      const settings = await WorkspaceSettings.findOne({ userId: link.userId });
      const autoPublisherEnabled = settings?.autoPublisher ?? true;

      let postCreated = false;
      if (autoPublisherEnabled && sentiment !== "Negative") {
        try {
          const { created } = await createPostFromReview(link.userId, review);
          postCreated = created;
        } catch (error) {
          console.warn("Auto-publish from review failed:", (error as Error).message);
        }
      }

      res.status(201).json({ ok: true, review: serializeReview(review), postCreated });
    } catch (error) {
      console.error("Public review submit failed:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to submit review",
      });
    }
  },
);
