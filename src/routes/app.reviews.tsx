import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Filter, Sparkles, MessageSquare, Link2, Copy, RefreshCw, ExternalLink, AlertTriangle, Video } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { InstagramReelPreview } from "@/components/app/InstagramReelPreview";
import { Button } from "@/components/ui/button";
import { api, REEL_REQUEST_TIMEOUT_MS, reviewLinkApi } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reviews")({
  head: () => ({ meta: [{ title: "Reviews — ReevoAI" }] }),
  component: Reviews,
});

type Review = {
  id: string;
  name: string;
  source: string;
  stars: number;
  text: string;
  tag: string;
  sentiment?: "Positive" | "Negative" | "Mixed";
  images?: string[];
  publishingPostId?: string | null;
  reelVideoUrl?: string;
  reelScript?: string;
};

function reviewSentiment(r: Review): "Positive" | "Negative" | "Mixed" {
  const s = r.sentiment ?? r.tag;
  if (s === "Negative" || s === "Mixed" || s === "Positive") return s;
  return "Positive";
}

function Reviews() {
  const [min, setMin] = useState(0);
  const [reelPreview, setReelPreview] = useState<Review | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<{ settings: { brandName: string } }>("/settings"),
  });
  const brandName = settingsData?.settings.brandName ?? "ReevoAI";

  const { data, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      api<{
        reviews: Review[];
        summary: { averageRating: string; totalReviews: number; responseRate: string; sentiment: string };
      }>("/reviews"),
  });

  const { data: linkData } = useQuery({
    queryKey: ["review-link"],
    queryFn: () => reviewLinkApi.get(),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => reviewLinkApi.regenerate(),
    onSuccess: () => {
      toast.success("New review link generated");
      void queryClient.invalidateQueries({ queryKey: ["review-link"] });
    },
    onError: () => toast.error("Failed to regenerate link"),
  });

  const replyMutation = useMutation({
    mutationFn: (id: string) => api<{ reply: string; source?: string }>(`/reviews/${id}/reply`, { method: "POST" }),
    onSuccess: (res) => {
      const note = res.source === "fallback" ? " (Gemini quota — template reply)" : "";
      toast.success(`Reply generated${note}`, { description: res.reply.slice(0, 80) + "…" });
    },
    onError: () => toast.error("Failed to generate reply"),
  });

  const reelMutation = useMutation({
    mutationFn: (review: Review) =>
      api<{ videoUrl: string; script: string; aiSource: string }>(`/reviews/${review.id}/generate-reel`, {
        method: "POST",
        timeoutMs: REEL_REQUEST_TIMEOUT_MS,
      }),
    onSuccess: (res, review) => {
      toast.success(res.aiSource === "gemini" ? "Reel video generated" : "Reel video created", {
        description: "Open Reel Preview to watch",
      });
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      setReelPreview({ ...review, reelVideoUrl: res.videoUrl, reelScript: res.script });
    },
    onError: () => toast.error("Failed to generate reel — is the API running?"),
  });

  const postMutation = useMutation({
    mutationFn: (id: string) =>
      api<{ post: { id: string }; created: boolean; aiSource: string }>(`/reviews/${id}/to-post`, {
        method: "POST",
      }),
    onSuccess: (res) => {
      const aiNote = res.aiSource === "gemini" ? " with AI caption" : "";
      toast.success(res.created ? `Draft created${aiNote}` : `Draft updated${aiNote}`, {
        description: "View in Publishing → Scheduled",
        action: {
          label: "Open",
          onClick: () =>
            void navigate({
              to: "/app/publishing",
              search: { tab: "scheduled", highlight: res.post.id },
            }),
        },
      });
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Failed to create post"),
  });

  const copyLink = () => {
    if (!linkData?.url) return;
    void navigator.clipboard.writeText(linkData.url);
    toast.success("Review link copied!");
  };

  const ALL = data?.reviews ?? [];
  const filtered = ALL.filter((r) => r.stars >= min);

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Reviews submitted by customers through your shareable review link."
        actions={
          <>
            <Button variant="outline" className="rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
            <Button asChild className="rounded-xl bg-[image:var(--gradient-primary)]">
              <Link to="/app/ai-content"><Sparkles className="mr-2 h-4 w-4" /> Generate content</Link>
            </Button>
          </>
        }
      />

      <div className="glass mb-6 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Customer review link</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Share this link so customers can leave a review with photos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="rounded-lg" onClick={copyLink} disabled={!linkData?.url}>
              <Copy className="mr-1 h-3 w-3" /> Copy link
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg"
              disabled={regenerateMutation.isPending}
              onClick={() => regenerateMutation.mutate()}
            >
              <RefreshCw className="mr-1 h-3 w-3" /> New link
            </Button>
            {linkData?.url && (
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <a href={linkData.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 h-3 w-3" /> Preview
                </a>
              </Button>
            )}
          </div>
        </div>
        {linkData?.url && (
          <div className="mt-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2">
            <code className="break-all text-xs text-primary">{linkData.url}</code>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs uppercase text-muted-foreground">Average rating</p>
              <p className="mt-2 font-display text-2xl font-semibold">{data?.summary.averageRating ?? "—"} ★</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-xs uppercase text-muted-foreground">Total reviews</p>
              <p className="mt-2 font-display text-2xl font-semibold">{data?.summary.totalReviews ?? 0}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-xs uppercase text-muted-foreground">Response rate</p>
              <p className="mt-2 font-display text-2xl font-semibold">{data?.summary.responseRate ?? "—"}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-xs uppercase text-muted-foreground">Sentiment</p>
              <p
                className={`mt-2 font-display text-2xl font-semibold ${
                  data?.summary.sentiment === "Needs attention"
                    ? "text-red-600"
                    : data?.summary.sentiment === "Mixed"
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {data?.summary.sentiment ?? "—"}
              </p>
            </div>
          </div>

          <div className="glass mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3">
            <span className="text-xs font-medium text-muted-foreground">Review link submissions only</span>
            <div className="flex items-center gap-1 text-xs">
              <span className="mr-1 text-muted-foreground">Min stars:</span>
              {[0, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setMin(n)}
                  className={`rounded-lg px-2 py-1 font-medium ${min === n ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  {n === 0 ? "Any" : `${n}+`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((r) => {
              const sentiment = reviewSentiment(r);
              const isNegative = sentiment === "Negative";
              const isMixed = sentiment === "Mixed";
              return (
              <div
                key={r.id}
                className={`rounded-2xl p-5 transition-shadow ${
                  isNegative
                    ? "border-2 border-red-500/70 bg-red-500/[0.04] shadow-sm shadow-red-500/10"
                    : isMixed
                      ? "glass border border-amber-500/40"
                      : "glass"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground ${
                        isNegative
                          ? "bg-gradient-to-br from-red-600 to-red-500"
                          : "bg-[image:var(--gradient-primary)]"
                      }`}
                    >
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">via {r.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isNegative && (
                      <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        <AlertTriangle className="h-3 w-3" /> Alert
                      </span>
                    )}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-3.5 w-3.5 ${
                            j < r.stars
                              ? isNegative
                                ? "fill-red-400 text-red-400"
                                : "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    isNegative ? "text-red-900/80 dark:text-red-200/90" : "text-muted-foreground"
                  }`}
                >
                  "{r.text}"
                </p>
                {r.images && r.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.images.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="block h-16 w-16 overflow-hidden rounded-lg border border-border/60">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isNegative
                          ? "border border-red-500/40 bg-red-500/15 text-red-700"
                          : isMixed
                            ? "bg-amber-500/10 text-amber-800"
                            : "bg-emerald-500/10 text-emerald-700"
                      }`}
                    >
                      {sentiment}
                    </span>
                    {r.publishingPostId && (
                      <button
                        type="button"
                        onClick={() =>
                          void navigate({
                            to: "/app/publishing",
                            search: { tab: "scheduled", highlight: r.publishingPostId! },
                          })
                        }
                        className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20"
                      >
                        In Publishing →
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg"
                      disabled={replyMutation.isPending}
                      onClick={() => replyMutation.mutate(r.id)}
                    >
                      <MessageSquare className="mr-1 h-3 w-3" /> Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-violet-500/40 text-violet-700 hover:bg-violet-500/10"
                      disabled={reelMutation.isPending}
                      onClick={() => reelMutation.mutate(r)}
                    >
                      <Video className="mr-1 h-3 w-3" /> {r.reelVideoUrl ? "Regenerate reel" : "Generate reel"}
                    </Button>
                    {r.reelVideoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-[#E1306C]/30 text-[#E1306C] hover:bg-[#E1306C]/10"
                        onClick={() => setReelPreview(r)}
                      >
                        <Video className="mr-1 h-3 w-3" /> Reel Preview
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className={`rounded-lg ${isNegative ? "bg-red-600 hover:bg-red-700" : "bg-[image:var(--gradient-primary)]"}`}
                      disabled={postMutation.isPending}
                      onClick={() => postMutation.mutate(r.id)}
                    >
                      <Sparkles className="mr-1 h-3 w-3" /> {r.publishingPostId ? "Refresh post" : "Turn into post"}
                    </Button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </>
      )}
      <InstagramReelPreview
        open={reelPreview !== null}
        onOpenChange={(open) => !open && setReelPreview(null)}
        post={
          reelPreview
            ? {
                title: reelPreview.name,
                content: reelPreview.reelScript ?? reelPreview.text,
                brandName,
                reviewText: reelPreview.text,
                reviewName: reelPreview.name,
                reviewStars: reelPreview.stars,
                videoUrl: reelPreview.reelVideoUrl,
                reelScript: reelPreview.reelScript,
              }
            : null
        }
      />
    </div>
  );
}
