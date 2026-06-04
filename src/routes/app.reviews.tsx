import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Filter, Sparkles, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/reviews")({
  head: () => ({ meta: [{ title: "Reviews — ReevoAI" }] }),
  component: Reviews,
});

const ALL = [
  { name: "Maya Rodriguez", source: "Google", stars: 5, text: "Best onboarding I've ever experienced. The team replies in minutes and the product just works.", tag: "Onboarding" },
  { name: "Daniel Kim", source: "Trustpilot", stars: 5, text: "Generated 8 reels from a single batch of reviews — wild. Our engagement doubled in two weeks.", tag: "Content" },
  { name: "Priya Shah", source: "G2", stars: 4, text: "Captions sound like our brand voice. Saved me 6 hours this week and our reach is climbing.", tag: "AI" },
  { name: "Leo Martins", source: "Capterra", stars: 5, text: "Auto-publishing across Instagram and LinkedIn just works. No more copy-paste hell.", tag: "Publishing" },
  { name: "Ava Chen", source: "Google", stars: 4, text: "Love how reviews are turned into testimonial videos automatically. The voiceovers are great.", tag: "Video" },
  { name: "Noah Patel", source: "Yelp", stars: 3, text: "Decent overall, would love more granular control over hashtags per channel.", tag: "Feature request" },
  { name: "Sofia Reyes", source: "Trustpilot", stars: 5, text: "Customers don't realize the posts are AI — feels totally human. That's the magic.", tag: "AI" },
  { name: "Marcus Lee", source: "G2", stars: 5, text: "Switched from three tools to just ReevoAI. ROI was visible in under a month.", tag: "ROI" },
];

const sources = ["All", "Google", "Trustpilot", "G2", "Capterra", "Yelp"];

function Reviews() {
  const [src, setSrc] = useState("All");
  const [min, setMin] = useState(0);
  const filtered = ALL.filter((r) => (src === "All" || r.source === src) && r.stars >= min);
  const avg = (ALL.reduce((s, r) => s + r.stars, 0) / ALL.length).toFixed(2);

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Centralized inbox for every customer review across your connected sources."
        actions={
          <>
            <Button variant="outline" className="rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
            <Button className="rounded-xl bg-[image:var(--gradient-primary)]"><Sparkles className="mr-2 h-4 w-4" /> Generate from selection</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase text-muted-foreground">Average rating</p>
          <p className="mt-2 font-display text-2xl font-semibold">{avg} ★</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase text-muted-foreground">Total reviews</p>
          <p className="mt-2 font-display text-2xl font-semibold">12,418</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase text-muted-foreground">Response rate</p>
          <p className="mt-2 font-display text-2xl font-semibold">96%</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase text-muted-foreground">Sentiment</p>
          <p className="mt-2 font-display text-2xl font-semibold text-emerald-600">Positive</p>
        </div>
      </div>

      <div className="glass mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="flex flex-wrap gap-1">
          {sources.map((s) => (
            <button
              key={s}
              onClick={() => setSrc(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                src === s ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs">
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
        {filtered.map((r, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-sm font-semibold text-primary-foreground">
                  {r.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">via {r.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`h-3.5 w-3.5 ${j < r.stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{r.tag}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="rounded-lg"><MessageSquare className="mr-1 h-3 w-3" /> Reply</Button>
                <Button size="sm" className="rounded-lg bg-[image:var(--gradient-primary)]"><Sparkles className="mr-1 h-3 w-3" /> Turn into post</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}