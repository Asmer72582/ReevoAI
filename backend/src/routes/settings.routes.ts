import { Router } from "express";
import { z } from "zod";

import { type AuthedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { WorkspaceSettings } from "../models/WorkspaceSettings.js";
import { toObjectId } from "../utils/objectId.js";
import { serializeSettings } from "../utils/serializers.js";

export const settingsRouter = Router();

settingsRouter.get("/settings", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  const settings = await WorkspaceSettings.findOne({ userId });
  if (!settings) {
    res.status(404).json({ error: "Settings not found" });
    return;
  }

  res.json({ settings: serializeSettings(settings) });
});

settingsRouter.put("/settings", requireAuth, async (req: AuthedRequest, res) => {
  const body = z
    .object({
      brandName: z.string().optional(),
      brandVoice: z.string().optional(),
      defaultHashtags: z.string().optional(),
      autoPublisher: z.boolean().optional(),
      channels: z.array(z.object({ name: z.string(), connected: z.boolean() })).optional(),
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

  const settings = await WorkspaceSettings.findOneAndUpdate({ userId }, body.data, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

  res.json({ settings: serializeSettings(settings!) });
});
