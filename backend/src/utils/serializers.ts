import type { PostDocument } from "../models/Post.js";
import type { ReviewDocument } from "../models/Review.js";
import type { WorkspaceSettingsDocument } from "../models/WorkspaceSettings.js";
import { analyzeReviewSentiment } from "../services/sentiment.service.js";
import { formatWhen } from "./formatWhen.js";

export function serializeReview(r: ReviewDocument) {
  const sentiment = analyzeReviewSentiment(r.text, r.stars);
  return {
    id: r._id.toString(),
    userId: r.userId.toString(),
    name: r.name,
    source: r.source,
    stars: r.stars,
    text: r.text,
    tag: sentiment,
    sentiment,
    images: r.images ?? [],
    reelVideoUrl: r.reelVideoUrl ?? "",
    reelScript: r.reelScript ?? "",
    createdAt: r.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function serializePost(p: PostDocument) {
  const scheduledAt = p.scheduledAt ? p.scheduledAt.toISOString() : null;
  return {
    id: p._id.toString(),
    userId: p.userId.toString(),
    title: p.title,
    content: p.content,
    channels: p.channels,
    status: p.status,
    scheduledAt,
    when: formatWhen(p.scheduledAt),
    reviewId: p.reviewId?.toString() ?? null,
    reviewName: p.reviewName ?? "",
    reviewStars: p.reviewStars ?? null,
    imageUrl: p.imageUrl ?? (p.imageUrls?.[0] ?? ""),
    imageUrls: p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [],
    reviewText: p.reviewText ?? "",
    imageSource: p.imageSource ?? "",
    aiSource: p.aiSource ?? "",
    videoUrl: p.videoUrl ?? "",
    reelScript: p.reelScript ?? "",
    createdAt: p.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function serializeSettings(s: WorkspaceSettingsDocument) {
  return {
    userId: s.userId.toString(),
    brandName: s.brandName,
    brandVoice: s.brandVoice,
    defaultHashtags: s.defaultHashtags,
    autoPublisher: s.autoPublisher ?? true,
    channels: s.channels,
  };
}
