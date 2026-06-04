import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, MessageSquare, Share2, TrendingUp, ArrowUpRight, Instagram, Facebook, Linkedin, Youtube, Twitter, Sparkles } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — ReevoAI" }] }),
  component: Dashboard,
});

const recent = [
  { name: "Maya R.", text: "Best onboarding I've ever experienced. The team replies in minutes.", stars: 5, source: "Google" },
  { name: "Daniel K.", text: "Generated 8 reels from a single batch of reviews — wild.", stars: 5, source: "Trustpilot" },
  { name: "Priya S.", text: "Captions sound like our brand voice. Saved 6 hours this week.", stars: 4, source: "G2" },
  { name: "Leo M.", text: "Auto-publishing across IG and LinkedIn just works.", stars: 5, source: "Capterra" },
];

const platforms = [
  { name: "Instagram", icon: Instagram, posts: 142, reach: "84.2k" },
  { name: "Facebook", icon: Facebook, posts: 96, reach: "52.7k" },
  { name: "LinkedIn", icon: Linkedin, posts: 73, reach: "41.1k" },
  { name: "YouTube", icon: Youtube, posts: 28, reach: "126k" },
  { name: "X", icon: Twitter, posts: 184, reach: "31.4k" },
];

function MiniChart() {
  const pts = [22, 30, 26, 38, 34, 48, 44, 58, 62, 70, 66, 82];
  const w = 600, h = 160, max = 90;
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
  return (
    <div>
      <PageHeader
        title="Welcome back, Alex 👋"
        description="Here's what's happening across your reviews and channels today."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">Export</Button>
            <Button className="rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)]">
              <Sparkles className="mr-2 h-4 w-4" /> New AI campaign
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New reviews" value="1,284" delta="+18.2% vs last week" icon={Star} />
        <StatCard label="AI posts generated" value="362" delta="+24.6%" icon={MessageSquare} />
        <StatCard label="Auto-published" value="221" delta="+12.1%" icon={Share2} />
        <StatCard label="Engagement rate" value="6.84%" delta="+1.4%" icon={TrendingUp} />
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
          <MiniChart />
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Channel performance</h2>
          <div className="mt-4 space-y-3">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                  <p.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.reach} reach</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                      style={{ width: `${Math.min(100, p.posts / 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
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
            {recent.map((r) => (
              <div key={r.name} className="rounded-xl border border-border/60 bg-background/60 p-3">
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
            {[
              { when: "Today · 14:00", title: "Testimonial reel — Maya R.", ch: "Instagram + TikTok" },
              { when: "Today · 18:30", title: "Carousel: 5 wins from G2", ch: "LinkedIn" },
              { when: "Tomorrow · 09:15", title: "Quote graphic — Daniel K.", ch: "X + Facebook" },
              { when: "Tomorrow · 17:00", title: "Customer story video", ch: "YouTube Shorts" },
            ].map((p) => (
              <div key={p.title} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.when} · {p.ch}</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-lg">Edit</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}