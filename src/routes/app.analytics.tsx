import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Eye, Heart, Share2, Users } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/PageHeader";
import { QueryState } from "@/components/app/QueryState";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — ReevoAI" }] }),
  component: Analytics,
});

function AreaChart({ reach, engagement }: { reach: number[]; engagement: number[] }) {
  const w = 700, h = 220, max = 80;
  const toPath = (arr: number[]) =>
    arr.map((p, i) => `${(i / (arr.length - 1)) * w},${h - (p / max) * h}`).join(" L ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
      <defs>
        <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.58 0.22 256)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="oklch(0.58 0.22 256)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gb" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.13 14)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.78 0.13 14)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M 0,${h} L ${toPath(reach)} L ${w},${h} Z`} fill="url(#ga)" />
      <path d={`M ${toPath(reach)}`} fill="none" stroke="oklch(0.58 0.22 256)" strokeWidth="2.5" />
      <path d={`M 0,${h} L ${toPath(engagement)} L ${w},${h} Z`} fill="url(#gb)" />
      <path d={`M ${toPath(engagement)}`} fill="none" stroke="oklch(0.78 0.13 14)" strokeWidth="2.5" />
    </svg>
  );
}

function Bars({ data }: { data: { name: string; value: number; reach: string }[] }) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No channel data yet — schedule posts to see reach.</p>;
  }
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between text-xs">
            <span className="font-medium">{d.name}</span>
            <span className="text-muted-foreground">{d.reach} reach</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${d.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Analytics() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: () =>
      api<{
        stats: { impressions: string; engagements: string; shares: string; newFollowers: string };
        reachTrend: number[];
        engagementTrend: number[];
        channelReach: { name: string; value: number; reach: string }[];
        topPosts: { id: string; title: string; reach: string; engagement: string }[];
        audience: {
          topCountry: string;
          topAge: string;
          peakTime: string;
          sentiment: string;
          positiveReviews: number;
          totalReviews: number;
          scheduledPosts: number;
          publishedPosts: number;
        };
        meta: { postCount: number; reviewCount: number };
      }>("/analytics"),
  });

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track reach, engagement and conversion across every AI-generated campaign."
      />

      <QueryState loading={isLoading} error={isError ? error : null} onRetry={() => void refetch()}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Impressions"
          value={data?.stats.impressions ?? "—"}
          delta={data?.meta ? `${data.meta.postCount} posts` : undefined}
          icon={Eye}
        />
        <StatCard
          label="Engagements"
          value={data?.stats.engagements ?? "—"}
          delta={data?.meta ? `${data.meta.reviewCount} reviews` : undefined}
          icon={Heart}
        />
        <StatCard
          label="Shares"
          value={data?.stats.shares ?? "—"}
          delta={data?.audience ? `${data.audience.publishedPosts} published` : undefined}
          icon={Share2}
        />
        <StatCard
          label="New followers"
          value={data?.stats.newFollowers ?? "—"}
          delta={data?.audience ? `${data.audience.positiveReviews} positive` : undefined}
          icon={Users}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Reach vs. Engagement</h2>
              <p className="text-xs text-muted-foreground">Last 12 weeks</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Reach</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[color:var(--accent-pink-strong)]" /> Engagement</span>
            </div>
          </div>
          {(data?.reachTrend?.length ?? 0) > 0 ? (
            <AreaChart reach={data?.reachTrend ?? []} engagement={data?.engagementTrend ?? []} />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Trend data appears as you add reviews and schedule posts.
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Channel reach</h2>
          <p className="text-xs text-muted-foreground">This month</p>
          <div className="mt-4">
            <Bars data={data?.channelReach ?? []} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Top performing posts</h2>
          <div className="mt-3 divide-y divide-border/60">
            {(data?.topPosts ?? []).length === 0 && (
              <p className="py-6 text-sm text-muted-foreground">No posts yet — turn reviews into scheduled posts to track performance.</p>
            )}
            {(data?.topPosts ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">{p.title}</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{p.reach} reach</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600">
                    <TrendingUp className="-mt-0.5 mr-1 inline h-3 w-3" />{p.engagement}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Audience insights</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground">Review source</p>
              <p className="mt-1 font-display text-lg font-semibold">{data?.audience.topCountry ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground">Customers</p>
              <p className="mt-1 font-display text-lg font-semibold">{data?.audience.topAge ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground">Peak time</p>
              <p className="mt-1 font-display text-lg font-semibold">{data?.audience.peakTime}</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground">Sentiment</p>
              <p
                className={`mt-1 font-display text-lg font-semibold ${
                  data?.audience.sentiment?.includes("negative")
                    ? "text-amber-600"
                    : data?.audience.sentiment && data.audience.sentiment !== "—"
                      ? "text-emerald-600"
                      : ""
                }`}
              >
                {data?.audience.sentiment ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
      </QueryState>
    </div>
  );
}
