import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Plus, Instagram, Facebook, Linkedin, Youtube, Twitter, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/publishing")({
  head: () => ({ meta: [{ title: "Publishing — ReevoAI" }] }),
  component: Publishing,
});

const ICONS = { Instagram, Facebook, LinkedIn: Linkedin, YouTube: Youtube, X: Twitter };

type Post = {
  id: number;
  title: string;
  channels: (keyof typeof ICONS)[];
  status: "scheduled" | "published" | "draft";
  when: string;
};

const POSTS: Post[] = [
  { id: 1, title: "Testimonial reel — Maya R.", channels: ["Instagram", "X"], status: "scheduled", when: "Today · 14:00" },
  { id: 2, title: "Carousel: 5 wins from G2", channels: ["LinkedIn"], status: "scheduled", when: "Today · 18:30" },
  { id: 3, title: "Quote graphic — Daniel K.", channels: ["X", "Facebook"], status: "scheduled", when: "Tomorrow · 09:15" },
  { id: 4, title: "Customer story video", channels: ["YouTube"], status: "scheduled", when: "Tomorrow · 17:00" },
  { id: 5, title: "Onboarding tips reel", channels: ["Instagram"], status: "published", when: "Yesterday · 12:00" },
  { id: 6, title: "Feature launch teaser", channels: ["LinkedIn", "X"], status: "published", when: "Yesterday · 09:30" },
  { id: 7, title: "Behind the scenes draft", channels: ["Instagram"], status: "draft", when: "—" },
];

const tabs = [
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
] as const;

function Publishing() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("scheduled");
  const list = POSTS.filter((p) => p.status === tab);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = [3, 2, 4, 1, 5, 2, 0];

  return (
    <div>
      <PageHeader
        title="Publishing"
        description="Schedule, queue and track posts across every connected channel."
        actions={
          <>
            <Button variant="outline" className="rounded-xl"><Calendar className="mr-2 h-4 w-4" /> Calendar view</Button>
            <Button className="rounded-xl bg-[image:var(--gradient-primary)]"><Plus className="mr-2 h-4 w-4" /> New post</Button>
          </>
        }
      />

      <div className="glass mb-6 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">This week</h2>
          <span className="text-xs text-muted-foreground">17 posts queued</span>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div key={d} className="rounded-xl border border-border/60 bg-background/60 p-3 text-center">
              <p className="text-xs text-muted-foreground">{d}</p>
              <p className="mt-2 font-display text-xl font-semibold">{counts[i]}</p>
              <div className="mt-2 flex justify-center gap-0.5">
                {Array.from({ length: counts[i] }).map((_, j) => (
                  <div key={j} className="h-1 w-1 rounded-full bg-primary" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass mb-4 inline-flex rounded-2xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((p) => (
          <div key={p.id} className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-[color:var(--accent-pink)]/40 text-primary">
              {p.status === "published" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.when}</p>
            </div>
            <div className="flex items-center gap-1">
              {p.channels.map((c) => {
                const Icon = ICONS[c];
                return (
                  <div key={c} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg">Preview</Button>
              <Button size="sm" variant="outline" className="rounded-lg">Edit</Button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </div>
        )}
      </div>
    </div>
  );
}