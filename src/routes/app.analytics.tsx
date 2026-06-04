import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Eye, Heart, Share2, Users } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/PageHeader";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — ReevoAI" }] }),
  component: Analytics,
});

function AreaChart() {
  const a = [12, 18, 16, 28, 24, 36, 30, 44, 48, 56, 52, 68];
  const b = [8, 12, 14, 18, 22, 24, 28, 32, 36, 42, 46, 54];
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
      <path d={`M 0,${h} L ${toPath(a)} L ${w},${h} Z`} fill="url(#ga)" />
      <path d={`M ${toPath(a)}`} fill="none" stroke="oklch(0.58 0.22 256)" strokeWidth="2.5" />
      <path d={`M 0,${h} L ${toPath(b)} L ${w},${h} Z`} fill="url(#gb)" />
      <path d={`M ${toPath(b)}`} fill="none" stroke="oklch(0.78 0.13 14)" strokeWidth="2.5" />
    </svg>
  );
}

function Bars() {
  const data = [
    { name: "Instagram", v: 84 },
    { name: "LinkedIn", v: 62 },
    { name: "X", v: 48 },
    { name: "Facebook", v: 41 },
    { name: "YouTube", v: 72 },
    { name: "TikTok", v: 58 },
  ];
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between text-xs">
            <span className="font-medium">{d.name}</span>
            <span className="text-muted-foreground">{d.v}k reach</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${d.v}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Analytics() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Track reach, engagement and conversion across every AI-generated campaign."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Impressions" value="412.8k" delta="+22.4%" icon={Eye} />
        <StatCard label="Engagements" value="28.2k" delta="+15.1%" icon={Heart} />
        <StatCard label="Shares" value="3,914" delta="+9.6%" icon={Share2} />
        <StatCard label="New followers" value="1,627" delta="+34.2%" icon={Users} />
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
          <AreaChart />
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Channel reach</h2>
          <p className="text-xs text-muted-foreground">This month</p>
          <div className="mt-4">
            <Bars />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Top performing posts</h2>
          <div className="mt-3 divide-y divide-border/60">
            {[
              { t: "Testimonial reel — Maya R.", r: "82.1k", e: "9.4%" },
              { t: "Carousel: 5 wins from G2", r: "61.7k", e: "7.8%" },
              { t: "Quote graphic — Daniel K.", r: "44.3k", e: "6.1%" },
              { t: "Customer story video", r: "126k", e: "5.2%" },
            ].map((p) => (
              <div key={p.t} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">{p.t}</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{p.r} reach</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600">
                    <TrendingUp className="-mt-0.5 mr-1 inline h-3 w-3" />{p.e}
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
              <p className="text-xs text-muted-foreground">Top country</p>
              <p className="mt-1 font-display text-lg font-semibold">United States</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground">Top age</p>
              <p className="mt-1 font-display text-lg font-semibold">25–34</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground">Peak time</p>
              <p className="mt-1 font-display text-lg font-semibold">6–9 PM</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <p className="text-xs text-muted-foreground">Sentiment</p>
              <p className="mt-1 font-display text-lg font-semibold text-emerald-600">92% positive</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}