import { Router } from "express";

import { type AuthedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { Post } from "../models/Post.js";
import { Review } from "../models/Review.js";
import { buildDashboard } from "../services/analytics.service.js";
import { toObjectId } from "../utils/objectId.js";

export const dashboardRouter = Router();

dashboardRouter.get("/dashboard", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  const [reviews, posts] = await Promise.all([
    Review.find({ userId, source: "Review Link" }).sort({ createdAt: -1 }),
    Post.find({ userId }).sort({ createdAt: -1 }),
  ]);

  res.json(buildDashboard(reviews, posts));
});
