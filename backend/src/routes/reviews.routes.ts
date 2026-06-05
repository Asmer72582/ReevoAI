import { Router } from "express";

import { type AuthedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { Post } from "../models/Post.js";
import { Review } from "../models/Review.js";
import { WorkspaceSettings } from "../models/WorkspaceSettings.js";
import { generateReviewReply } from "../services/gemini.service.js";
import { createPostFromReview } from "../services/review-post.service.js";
import { generateReviewReel } from "../services/reel.service.js";
import { summarizeSentiment } from "../services/sentiment.service.js";
import { paramId, toObjectId } from "../utils/objectId.js";
import { serializeReview } from "../utils/serializers.js";

export const reviewsRouter = Router();

reviewsRouter.get("/reviews", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  const reviews = await Review.find({ userId, source: "Review Link" }).sort({ createdAt: -1 });
  const reviewIds = reviews.map((r) => r._id);
  const linkedPosts = await Post.find({ userId, reviewId: { $in: reviewIds } }).select("reviewId");
  const postByReview = new Map(linkedPosts.map((p) => [p.reviewId?.toString() ?? "", p._id.toString()]));
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0;

  res.json({
    reviews: reviews.map((r) => ({
      ...serializeReview(r),
      publishingPostId: postByReview.get(r._id.toString()) ?? null,
    })),
    summary: {
      averageRating: avg.toFixed(2),
      totalReviews: reviews.length,
      responseRate: reviews.length ? "96%" : "0%",
      sentiment: summarizeSentiment(reviews),
    },
  });
});

reviewsRouter.post("/reviews/:id/reply", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  const reviewId = toObjectId(paramId(req.params.id));
  if (!userId || !reviewId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const settings = await WorkspaceSettings.findOne({ userId });
  const { reply, source } = await generateReviewReply(review.text, settings?.brandVoice);
  res.json({ reply, source });
});

reviewsRouter.post("/reviews/:id/generate-reel", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  const reviewId = toObjectId(paramId(req.params.id));
  if (!userId || !reviewId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const settings = await WorkspaceSettings.findOne({ userId });

  try {
    const reel = await generateReviewReel(review, {
      brandName: settings?.brandName ?? "ReevoAI",
      brandVoice: settings?.brandVoice,
    });

    review.reelVideoUrl = reel.videoUrl;
    review.reelScript = reel.script;
    await review.save();

    const linkedPost = await Post.findOne({ userId, reviewId: review._id });
    if (linkedPost) {
      linkedPost.videoUrl = reel.videoUrl;
      linkedPost.reelScript = reel.script;
      await linkedPost.save();
    }

    res.json({
      videoUrl: reel.videoUrl,
      script: reel.script,
      aiSource: reel.aiSource,
    });
  } catch (error) {
    console.error("Reel generation failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Failed to generate reel video";
    res.status(500).json({ error: message });
  }
});

reviewsRouter.post("/reviews/:id/to-post", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  const reviewId = toObjectId(paramId(req.params.id));
  if (!userId || !reviewId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  const result = await createPostFromReview(userId, review, { updateExisting: true });
  res.json({
    post: result.post,
    created: result.created,
    aiSource: result.aiSource,
  });
});
