import { Router } from "express";

import { listSocialChannelLinks } from "../lib/social-channels.js";
import { type AuthedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { connectSocialChannel } from "../services/channel-connect.service.js";
import { toObjectId } from "../utils/objectId.js";

export const channelsRouter = Router();

channelsRouter.get("/channels/links", requireAuth, (_req, res) => {
  res.json({ channels: listSocialChannelLinks() });
});

channelsRouter.post("/channels/:name/connect", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  const channelName = decodeURIComponent(String(req.params.name));

  try {
    const result = await connectSocialChannel(userId, channelName);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect channel";
    res.status(400).json({ error: message });
  }
});
