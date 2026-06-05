import { Router } from "express";
import { z } from "zod";

import { hashPassword, signToken, toSessionUser, verifyPassword } from "../lib/auth.js";
import { type AuthedRequest, requireAuth, setAuthCookie } from "../middleware/auth.middleware.js";
import { User } from "../models/User.js";
import { WorkspaceSettings } from "../models/WorkspaceSettings.js";
const DEFAULT_CHANNELS = [
  { name: "Instagram", connected: false },
  { name: "Facebook", connected: false },
  { name: "LinkedIn", connected: false },
  { name: "YouTube", connected: false },
  { name: "X", connected: false },
];

export const authRouter = Router();

authRouter.post("/auth/register", async (req, res) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1),
    })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: body.error.flatten() });
    return;
  }

  const email = body.data.email.toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const user = await User.create({
    email,
    name: body.data.name,
    passwordHash: await hashPassword(body.data.password),
  });

  await WorkspaceSettings.create({
    userId: user._id,
    brandName: "ReevoAI",
    brandVoice: "Confident, friendly, slightly witty. Short sentences. Customer-first.",
    defaultHashtags: "#SaaS #CustomerLove #ReevoAI",
    autoPublisher: true,
    channels: DEFAULT_CHANNELS,
  });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user: toSessionUser(user), token });
});

authRouter.post("/auth/login", async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const user = await User.findOne({ email: body.data.email.toLowerCase() });
  if (!user || !(await verifyPassword(body.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ user: toSessionUser(user), token });
});

authRouter.post("/auth/logout", (_req, res) => {
  res.clearCookie("reevo_token");
  res.json({ ok: true });
});

authRouter.get("/auth/me", requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});
