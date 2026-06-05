import type { PostDocument } from "../models/Post.js";
import type { ReviewDocument } from "../models/Review.js";
import { formatWhen } from "../utils/formatWhen.js";
import { analyzeReviewSentiment } from "./sentiment.service.js";

const CHANNELS = ["Instagram", "LinkedIn", "X", "Facebook", "YouTube", "TikTok"] as const;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function postImageCount(p: PostDocument): number {
  return p.imageUrls?.length || (p.imageUrl ? 1 : 0);
}

function estimatePostReach(p: PostDocument, review?: ReviewDocument): number {
  let reach = 400;
  reach += p.channels.length * 280;
  reach += postImageCount(p) * 320;
  if (p.content) reach += Math.min(p.content.length, 200);
  if (p.status === "published") reach *= 1.8;
  if (p.status === "scheduled") reach *= 1.2;
  if (p.reviewStars) reach += p.reviewStars * 180;
  if (review) reach += review.stars * 120;
  return Math.round(reach);
}

function estimatePostEngagement(p: PostDocument, review?: ReviewDocument): number {
  let rate = 4.5;
  rate += p.channels.length * 0.6;
  rate += postImageCount(p) * 0.4;
  if (p.aiSource === "gemini") rate += 1.2;
  if (p.reviewStars) rate += p.reviewStars * 0.35;
  if (review) {
    const sentiment = analyzeReviewSentiment(review.text, review.stars);
    if (sentiment === "Positive") rate += 2.5;
    if (sentiment === "Negative") rate -= 2;
  }
  return Math.min(18, Math.max(1.5, Math.round(rate * 10) / 10));
}

function weekStart(d: Date): number {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy.getTime();
}

function buildWeeklyBuckets(weeks: number): number[] {
  const now = weekStart(new Date());
  return Array.from({ length: weeks }, (_, i) => now - (weeks - 1 - i) * 7 * 24 * 60 * 60 * 1000);
}

export function buildAnalytics(reviews: ReviewDocument[], posts: PostDocument[]) {
  const reviewById = new Map(reviews.map((r) => [r._id.toString(), r]));

  const published = posts.filter((p) => p.status === "published");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const totalImages = posts.reduce((s, p) => s + postImageCount(p), 0);

  const sentiments = reviews.map((r) => analyzeReviewSentiment(r.text, r.stars));
  const positiveCount = sentiments.filter((s) => s === "Positive").length;
  const negativeCount = sentiments.filter((s) => s === "Negative").length;

  const postReachTotal = posts.reduce((s, p) => {
    const review = p.reviewId ? reviewById.get(p.reviewId.toString()) : undefined;
    return s + estimatePostReach(p, review);
  }, 0);

  const impressions = postReachTotal + reviews.length * 620 + totalImages * 210;
  const engagements = Math.round(
    reviews.length * 95 + posts.length * 78 + positiveCount * 140 + published.length * 220,
  );
  const shares = Math.round(published.length * 38 + scheduled.length * 12 + positiveCount * 8);
  const newFollowers = Math.round(positiveCount * 14 + published.length * 11 + reviews.length * 3);

  const buckets = buildWeeklyBuckets(12);
  const reachTrend = buckets.map((bucketStart) => {
    const bucketEnd = bucketStart + 7 * 24 * 60 * 60 * 1000;
    let score = 0;
    for (const p of posts) {
      const t = p.createdAt?.getTime() ?? 0;
      if (t >= bucketStart && t < bucketEnd) {
        const review = p.reviewId ? reviewById.get(p.reviewId.toString()) : undefined;
        score += estimatePostReach(p, review) / 100;
      }
    }
    for (const r of reviews) {
      const t = r.createdAt?.getTime() ?? 0;
      if (t >= bucketStart && t < bucketEnd) {
        score += r.stars * 4 + (r.images?.length ?? 0) * 3;
      }
    }
    return Math.round(score);
  });

  const engagementTrend = buckets.map((bucketStart) => {
    const bucketEnd = bucketStart + 7 * 24 * 60 * 60 * 1000;
    let score = 0;
    for (const p of posts) {
      const t = p.createdAt?.getTime() ?? 0;
      if (t >= bucketStart && t < bucketEnd) {
        const review = p.reviewId ? reviewById.get(p.reviewId.toString()) : undefined;
        score += estimatePostEngagement(p, review);
      }
    }
    for (const r of reviews) {
      const t = r.createdAt?.getTime() ?? 0;
      if (t >= bucketStart && t < bucketEnd) {
        const sentiment = analyzeReviewSentiment(r.text, r.stars);
        score += sentiment === "Positive" ? 8 : sentiment === "Mixed" ? 5 : 2;
      }
    }
    return Math.round(score);
  });

  const channelTotals = new Map<string, number>();
  for (const ch of CHANNELS) channelTotals.set(ch, 0);

  for (const p of posts) {
    for (const ch of p.channels) {
      const review = p.reviewId ? reviewById.get(p.reviewId.toString()) : undefined;
      const current = channelTotals.get(ch) ?? 0;
      channelTotals.set(ch, current + estimatePostReach(p, review));
    }
  }

  const channelEntries = CHANNELS.map((name) => ({
    name,
    reach: channelTotals.get(name) ?? 0,
  })).filter((c) => c.reach > 0);

  const maxChannelReach = Math.max(...channelEntries.map((c) => c.reach), 1);
  const channelReach = channelEntries
    .sort((a, b) => b.reach - a.reach)
    .map((c) => ({
      name: c.name,
      value: Math.round((c.reach / maxChannelReach) * 100),
      reach: formatCount(c.reach),
    }));

  const topPosts = posts
    .map((p) => {
      const review = p.reviewId ? reviewById.get(p.reviewId.toString()) : undefined;
      const reach = estimatePostReach(p, review);
      return {
        id: p._id.toString(),
        title: p.title,
        reach: formatCount(reach),
        engagement: `${estimatePostEngagement(p, review)}%`,
        reachRaw: reach,
      };
    })
    .sort((a, b) => b.reachRaw - a.reachRaw)
    .slice(0, 6)
    .map(({ reachRaw: _, ...rest }) => rest);

  const hourCounts = new Array(24).fill(0);
  for (const p of posts) {
    if (!p.scheduledAt) continue;
    hourCounts[p.scheduledAt.getHours()] += 1;
  }
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakTime =
    Math.max(...hourCounts) > 0
      ? formatPeakWindow(peakHour)
      : posts.length
        ? "10:00–13:00"
        : "—";

  const sentimentPct =
    reviews.length > 0 ? Math.round((positiveCount / reviews.length) * 100) : null;

  return {
    stats: {
      impressions: formatCount(impressions),
      engagements: formatCount(engagements),
      shares: shares.toLocaleString(),
      newFollowers: newFollowers.toLocaleString(),
    },
    reachTrend: normalizeTrend(reachTrend),
    engagementTrend: normalizeTrend(engagementTrend),
    channelReach,
    topPosts,
    audience: {
      topCountry: reviews.length ? "Review link submissions" : "—",
      topAge: reviews.length ? `${reviews.length} customer${reviews.length > 1 ? "s" : ""}` : "—",
      peakTime,
      sentiment: sentimentPct !== null
        ? negativeCount > 0
          ? `${sentimentPct}% positive · ${negativeCount} negative`
          : `${sentimentPct}% positive`
        : "—",
      positiveReviews: positiveCount,
      totalReviews: reviews.length,
      scheduledPosts: scheduled.length,
      publishedPosts: published.length,
    },
    meta: {
      postCount: posts.length,
      reviewCount: reviews.length,
    },
  };
}

function normalizeTrend(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => Math.max(1, Math.round((v / max) * 80)));
}

function formatPeakWindow(hour: number): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const end = (hour + 3) % 24;
  return `${pad(hour)}:00–${pad(end)}:00`;
}

function formatReviewerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] ?? name;
  return `${parts[0]} ${parts[1]![0]}.`;
}

export function buildDashboard(reviews: ReviewDocument[], posts: PostDocument[]) {
  const analytics = buildAnalytics(reviews, posts);
  const reviewById = new Map(reviews.map((r) => [r._id.toString(), r]));

  const channelTotals = new Map<string, { posts: number; reach: number }>();
  for (const ch of CHANNELS) channelTotals.set(ch, { posts: 0, reach: 0 });

  for (const p of posts) {
    for (const ch of p.channels) {
      const review = p.reviewId ? reviewById.get(p.reviewId.toString()) : undefined;
      const current = channelTotals.get(ch) ?? { posts: 0, reach: 0 };
      channelTotals.set(ch, {
        posts: current.posts + 1,
        reach: current.reach + estimatePostReach(p, review),
      });
    }
  }

  const channelEntries = CHANNELS.map((name) => ({
    name,
    ...channelTotals.get(name)!,
  })).filter((c) => c.posts > 0);

  const maxChannelReach = Math.max(...channelEntries.map((c) => c.reach), 1);
  const platformStats = channelEntries
    .sort((a, b) => b.reach - a.reach)
    .map((c) => ({
      name: c.name,
      posts: c.posts,
      reach: formatCount(c.reach),
      value: Math.round((c.reach / maxChannelReach) * 100),
    }));

  const published = posts.filter((p) => p.status === "published");
  const scheduled = posts.filter((p) => p.status === "scheduled");

  const avgEngagement =
    posts.length > 0
      ? posts.reduce((sum, p) => {
          const review = p.reviewId ? reviewById.get(p.reviewId.toString()) : undefined;
          return sum + estimatePostEngagement(p, review);
        }, 0) / posts.length
      : reviews.length > 0
        ? 4.2 + (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length) * 0.5
        : 0;

  return {
    stats: {
      newReviews: reviews.length,
      aiPostsGenerated: posts.length,
      autoPublished: published.length,
      engagementRate: `${avgEngagement.toFixed(2)}%`,
    },
    recentReviews: reviews.slice(0, 4).map((r) => ({
      id: r._id.toString(),
      name: formatReviewerName(r.name),
      text: r.text,
      stars: r.stars,
      source: r.source,
    })),
    upcomingPosts: scheduled.slice(0, 4).map((p) => ({
      id: p._id.toString(),
      title: p.title,
      when: formatWhen(p.scheduledAt),
      channels: p.channels.join(" + "),
    })),
    platformStats,
    engagementTrend: analytics.engagementTrend,
  };
}
