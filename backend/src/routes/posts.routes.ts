import { Router } from "express";
import { z } from "zod";

import { type AuthedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { Post } from "../models/Post.js";
import { paramId, toObjectId } from "../utils/objectId.js";
import { serializePost } from "../utils/serializers.js";

export const postsRouter = Router();

postsRouter.get("/posts", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  if (!userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }

  const status = req.query.status as string | undefined;
  const filter: Record<string, unknown> = { userId };
  if (status && ["scheduled", "published", "draft"].includes(status)) {
    filter.status = status;
  }

  const posts = await Post.find(filter).sort({ createdAt: -1 });

  res.json({
    posts: posts.map(serializePost),
    weekCounts: [3, 2, 4, 1, 5, 2, 0],
  });
});

postsRouter.post("/posts", requireAuth, async (req: AuthedRequest, res) => {
  const body = z
    .object({
      title: z.string().min(1),
      content: z.string().optional(),
      channels: z.array(z.string()).default(["Instagram"]),
      status: z.enum(["scheduled", "published", "draft"]).default("scheduled"),
      scheduledAt: z.string().nullable().optional(),
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

  const scheduledAt = body.data.scheduledAt
    ? new Date(body.data.scheduledAt)
    : body.data.status === "scheduled"
      ? defaultScheduleTime()
      : null;

  const post = await Post.create({
    userId,
    title: body.data.title,
    content: body.data.content ?? "",
    channels: body.data.channels,
    status: body.data.status,
    scheduledAt,
  });

  res.json({ post: serializePost(post) });
});

postsRouter.delete("/posts/:id", requireAuth, async (req: AuthedRequest, res) => {
  const userId = toObjectId(req.user!.id);
  const postId = toObjectId(paramId(req.params.id));
  if (!userId || !postId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const post = await Post.findOneAndDelete({ _id: postId, userId });
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({ ok: true });
});

function defaultScheduleTime(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d;
}

postsRouter.patch("/posts/:id", requireAuth, async (req: AuthedRequest, res) => {
  const body = z
    .object({
      title: z.string().optional(),
      content: z.string().optional(),
      channels: z.array(z.string()).optional(),
      status: z.enum(["scheduled", "published", "draft"]).optional(),
      scheduledAt: z.string().nullable().optional(),
      imageUrl: z.string().optional(),
    })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: body.error.flatten() });
    return;
  }

  const userId = toObjectId(req.user!.id);
  const postId = toObjectId(paramId(req.params.id));
  if (!userId || !postId) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const update: Record<string, unknown> = { ...body.data };
  if (body.data.scheduledAt !== undefined) {
    update.scheduledAt = body.data.scheduledAt ? new Date(body.data.scheduledAt) : null;
  }

  const post = await Post.findOneAndUpdate({ _id: postId, userId }, update, { new: true });
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({ post: serializePost(post) });
});
