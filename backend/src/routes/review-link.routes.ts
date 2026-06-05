import { randomBytes } from "node:crypto";

import { Router } from "express";

import { env } from "../config/env.js";
import { type AuthedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { ReviewLink } from "../models/ReviewLink.js";
import { toObjectId } from "../utils/objectId.js";

export const reviewLinkRouter = Router();

function buildReviewUrl(token: string): string {
  return `${env.publicAppUrl}/r/${token}`;
}

reviewLinkRouter.get("/review-link", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  let link = await ReviewLink.findOne({ userId });
  if (!link) {
    link = await ReviewLink.create({
      userId,
      token: randomBytes(16).toString("hex"),
      active: true,
    });
  }

  res.json({
    token: link.token,
    url: buildReviewUrl(link.token),
    active: link.active,
    label: link.label,
  });
});

reviewLinkRouter.post("/review-link/regenerate", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  const link = await ReviewLink.findOneAndUpdate(
    { userId },
    { token: randomBytes(16).toString("hex"), active: true },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.json({
    token: link!.token,
    url: buildReviewUrl(link!.token),
    active: link!.active,
    label: link!.label,
  });
});
