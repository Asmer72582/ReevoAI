import type mongoose from "mongoose";

import type { PostDocument } from "../models/Post.js";
import { Post } from "../models/Post.js";
import type { ReviewDocument } from "../models/Review.js";
import { WorkspaceSettings } from "../models/WorkspaceSettings.js";
import { generateReviewPostCaption } from "./gemini.service.js";
import { tryGenerateGeminiImage } from "./gemini-image.service.js";
import { generatePosterImage, generateReviewPhotoPoster } from "./poster.service.js";
import { serializePost } from "../utils/serializers.js";

export async function createPostFromReview(
  userId: mongoose.Types.ObjectId,
  review: ReviewDocument,
  options?: { updateExisting?: boolean },
): Promise<{ post: ReturnType<typeof serializePost>; created: boolean; aiSource: string }> {
  const existing = await Post.findOne({ userId, reviewId: review._id });

  const settings = await WorkspaceSettings.findOne({ userId });
  const brandName = settings?.brandName ?? "ReevoAI";
  const connectedChannels =
    settings?.channels?.filter((c) => c.connected).map((c) => c.name) ?? [];
  const channels = connectedChannels.length > 0 ? connectedChannels : ["Instagram", "LinkedIn"];

  const { title, content, source: aiSource } = await generateReviewPostCaption({
    name: review.name,
    text: review.text,
    stars: review.stars,
    brandName,
    brandVoice: settings?.brandVoice,
    hashtags: settings?.defaultHashtags,
  });

  const imageResult = await resolvePostImages(review, content, brandName, settings?.defaultHashtags);
  const scheduledAt = await nextScheduleSlot(userId);

  if (existing && !options?.updateExisting) {
    return { post: serializePost(existing), created: false, aiSource: existing.aiSource ?? "" };
  }

  const payload = {
    title,
    content,
    channels,
    status: "scheduled" as const,
    scheduledAt: existing?.scheduledAt ?? scheduledAt,
    reviewId: review._id,
    reviewName: review.name,
    reviewStars: review.stars,
    reviewText: review.text,
    imageUrl: imageResult.imageUrls[0] ?? "",
    imageUrls: imageResult.imageUrls,
    imageSource: imageResult.imageSource,
    aiSource,
    videoUrl: review.reelVideoUrl ?? "",
    reelScript: review.reelScript ?? "",
  };

  if (existing) {
    const updated = await Post.findOneAndUpdate({ _id: existing._id, userId }, payload, { new: true });
    return { post: serializePost(updated!), created: false, aiSource };
  }

  const post = await Post.create({ userId, ...payload });
  return { post: serializePost(post as PostDocument), created: true, aiSource };
}

async function resolvePostImages(
  review: ReviewDocument,
  aiCaption: string,
  brandName: string,
  hashtags?: string,
): Promise<{ imageUrls: string[]; imageSource: "review" | "poster" | "gemini" }> {
  const photos = review.images?.filter(Boolean) ?? [];
  const posterBase = {
    brandName,
    type: "quote" as const,
    tone: "Friendly" as const,
    hashtags,
    reviewerName: review.name,
    stars: review.stars,
    reviewText: review.text,
  };

  if (photos.length > 0) {
    const slides: string[] = [];
    for (const photoUrl of photos) {
      const composite = await generateReviewPhotoPoster({
        ...posterBase,
        content: aiCaption,
        photoUrl,
      });
      slides.push(composite ?? photoUrl);
    }
    const hasComposites = slides.some((url, i) => url !== photos[i]);
    return {
      imageUrls: slides,
      imageSource: hasComposites ? "poster" : "review",
    };
  }

  const geminiImage = await tryGenerateGeminiImage({
    content: `"${review.text}"\n\n${aiCaption}`,
    brandName,
    type: "quote",
    tone: "Friendly",
    prompt: `Customer review from ${review.name}: "${review.text}"`,
  });
  if (geminiImage) {
    return { imageUrls: [geminiImage], imageSource: "gemini" };
  }

  const poster = await generatePosterImage({
    content: review.text,
    brandName,
    type: "quote",
    tone: "Friendly",
    hashtags,
  });
  return { imageUrls: [poster], imageSource: "poster" };
}

async function nextScheduleSlot(userId: mongoose.Types.ObjectId): Promise<Date> {
  const count = await Post.countDocuments({ userId, status: "scheduled" });
  const d = new Date();
  d.setDate(d.getDate() + 1 + Math.floor(count / 4));
  d.setHours(9 + (count % 8), (count % 2) * 30, 0, 0);
  return d;
}
