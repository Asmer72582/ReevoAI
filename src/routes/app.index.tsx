import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare, Share2, TrendingUp, ArrowUpRight, Instagram, Facebook, Linkedin, Youtube, Twitter, Sparkles } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/app/QueryState";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — ReevoAI" }] }),
  component: Dashboard,
});

const ICONS: Record<string, typeof Instagram> = {
  Instagram,
  Facebook,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  X: Twitter,
};

function MiniChart({ points }: { points: number[] }) {
  const pts = points;
  const w = 600, h = 160, max = Math.max(...pts, 90);
  const d = pts
    .map((p, i) => `${(i / (pts.length - 1)) * w},${h - (p / max) * h}`)
    .join(" L ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.58 0.22 256)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.58 0.22 256)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M 0,${h} L ${d} L ${w},${h} Z`} fill="url(#g)" />
      <path d={`M ${d}`} fill="none" stroke="oklch(0.58 0.22 256)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<{
      stats: { newReviews: number; aiPostsGenerated: number; autoPublished: number; engagementRate: string };
      recentReviews: { id: string; name: string; text: string; stars: number; source: string }[];
      upcomingPosts: { id: string; title: string; when: string; channels: string }[];
      platformStats: { name: string; posts: number; reach: string; value: number }[];
      engagementTrend: number[];
    }>("/dashboard"),
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName} 👋`}
        description="Here's what's happening across your reviews and channels today."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">Export</Button>
            <Button asChild className="rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)]">
              <Link to="/app/ai-content">
                <Sparkles className="mr-2 h-4 w-4" /> New AI campaign
              </Link>
            </Button>
          </>
        }
      />

      <QueryState loading={isLoading} error={isError ? error : null} onRetry={() => void refetch()}>
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="New reviews" value={String(data?.stats.newReviews ?? 0)} delta="Live from API" icon={Star} />
            <StatCard label="AI posts generated" value={String(data?.stats.aiPostsGenerated ?? 0)} delta="All posts" icon={MessageSquare} />
            <StatCard label="Auto-published" value={String(data?.stats.autoPublished ?? 0)} delta="Published" icon={Share2} />
            <StatCard label="Engagement rate" value={data?.stats.engagementRate ?? "—"} delta="Estimated" icon={TrendingUp} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="glass rounded-2xl p-5 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">Engagement overview</h2>
                  <p className="text-xs text-muted-foreground">Last 12 weeks · all channels</p>
                </div>
                <Link to="/app/analytics" className="inline-flex items-center text-xs font-medium text-primary hover:underline">
                  View analytics <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              {(data?.engagementTrend?.length ?? 0) > 0 ? (
                <MiniChart points={data?.engagementTrend ?? []} />
              ) : (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Trend data appears as you add reviews and schedule posts.
                </p>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-display text-lg font-semibold">Channel performance</h2>
              <div className="mt-4 space-y-3">
                {(data?.platformStats ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No channel data yet — schedule posts to see reach.</p>
                )}
                {(data?.platformStats ?? []).map((p) => {
                  const Icon = ICONS[p.name] ?? Share2;
                  return (
                    <div key={p.name} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-muted-foreground">{p.reach} reach</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                            style={{ width: `${p.value}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Recent reviews</h2>
                <Link to="/app/reviews" className="text-xs font-medium text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-3">
                {(data?.recentReviews ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet — share your review link to collect feedback.</p>
                )}
                {(data?.recentReviews ?? []).map((r) => (
                  <div key={r.name + r.text} className="rounded-xl border border-border/60 bg-background/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{r.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r.stars }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">"{r.text}"</p>
                    <p className="mt-1 text-xs text-muted-foreground">via {r.source}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-display text-lg font-semibold">Upcoming posts</h2>
              <div className="mt-3 space-y-3">
                {(data?.upcomingPosts ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No scheduled posts — turn reviews into posts from Publishing.</p>
                )}
                {(data?.upcomingPosts ?? []).map((p) => (
                  <div key={p.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.when} · {p.channels}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-lg">
                      <Link to="/app/publishing">Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      </QueryState>
    </div>
  );
}
