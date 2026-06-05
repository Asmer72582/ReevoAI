import { Router } from "express";

import { type AuthedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { Post } from "../models/Post.js";
import { Review } from "../models/Review.js";
import { buildAnalytics } from "../services/analytics.service.js";
import { toObjectId } from "../utils/objectId.js";

export const analyticsRouter = Router();

analyticsRouter.get("/analytics", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  const [reviews, posts] = await Promise.all([
    Review.find({ userId, source: "Review Link" }),
    Post.find({ userId }).sort({ createdAt: -1 }),
  ]);

  res.json(buildAnalytics(reviews, posts));
});
