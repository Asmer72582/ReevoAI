import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";

import { Post } from "../models/Post.js";
import { Review } from "../models/Review.js";
import { ReviewLink } from "../models/ReviewLink.js";
import { User } from "../models/User.js";
import { WorkspaceSettings } from "../models/WorkspaceSettings.js";

const DEMO_EMAIL = "demo@reevoai.com";

export async function seedDemoData(): Promise<void> {
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) return;

  const user = await User.create({
    email: DEMO_EMAIL,
    name: "Alex Smith",
    passwordHash: bcrypt.hashSync("demo1234", 10),
  });

  const userId = user._id;

  await Review.insertMany([
    {
      userId,
      name: "Maya Rodriguez",
      source: "Review Link",
      stars: 5,
      text: "Best onboarding I've ever experienced. The team replies in minutes and the product just works.",
      tag: "Positive",
    },
    {
      userId,
      name: "Daniel Kim",
      source: "Review Link",
      stars: 5,
      text: "Generated 8 reels from a single batch of reviews — wild. Our engagement doubled in two weeks.",
      tag: "Positive",
    },
    {
      userId,
      name: "Priya Shah",
      source: "Review Link",
      stars: 4,
      text: "Captions sound like our brand voice. Saved me 6 hours this week and our reach is climbing.",
      tag: "Positive",
    },
  ]);

  await Post.insertMany([
    {
      userId,
      title: "Testimonial reel — Maya R.",
      content: "✨ Real talk from Maya R.: Best onboarding ever.",
      channels: ["Instagram", "X"],
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      userId,
      title: "Carousel: 5 wins from G2",
      content: "Five customer wins from G2 this week.",
      channels: ["LinkedIn"],
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
    {
      userId,
      title: "Quote graphic — Daniel K.",
      content: "Daniel K. shipped 8 reels from one batch of reviews.",
      channels: ["X", "Facebook"],
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      userId,
      title: "Customer story video",
      content: "Full customer story highlight reel.",
      channels: ["YouTube"],
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 30 * 60 * 60 * 1000),
    },
    {
      userId,
      title: "Onboarding tips reel",
      content: "Quick tips from our happiest customers.",
      channels: ["Instagram"],
      status: "published",
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      userId,
      title: "Feature launch teaser",
      content: "Something new is coming — stay tuned.",
      channels: ["LinkedIn", "X"],
      status: "published",
      scheduledAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    },
    {
      userId,
      title: "Behind the scenes draft",
      content: "Draft BTS post for the team.",
      channels: ["Instagram"],
      status: "draft",
      scheduledAt: null,
    },
  ]);

  await WorkspaceSettings.create({
    userId,
    brandName: "ReevoAI",
    brandVoice: "Confident, friendly, slightly witty. Short sentences. Customer-first.",
    defaultHashtags: "#SaaS #CustomerLove #ReevoAI",
    autoPublisher: true,
    channels: [
      { name: "Instagram", connected: true },
      { name: "Facebook", connected: true },
      { name: "LinkedIn", connected: true },
      { name: "YouTube", connected: false },
      { name: "X", connected: true },
    ],
  });

  console.log(`Seeded demo user: ${DEMO_EMAIL} / demo1234`);
}

/** Ensure every user has a review collection link (for existing DBs). */
export async function ensureReviewLinks(): Promise<void> {
  const users = await User.find().select("_id");
  for (const user of users) {
    const exists = await ReviewLink.findOne({ userId: user._id });
    if (!exists) {
      await ReviewLink.create({
        userId: user._id,
        token: randomBytes(16).toString("hex"),
        active: true,
      });
    }
  }
}
