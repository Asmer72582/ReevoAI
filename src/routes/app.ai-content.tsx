import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Wand2, Video, Image as ImageIcon, FileText, Copy, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/app/ai-content")({
  head: () => ({ meta: [{ title: "AI Content — ReevoAI" }] }),
  component: AIContent,
});

const TYPES = [
  { id: "caption", label: "Caption", icon: FileText },
  { id: "carousel", label: "Carousel", icon: ImageIcon },
  { id: "reel", label: "Reel script", icon: Video },
  { id: "quote", label: "Quote graphic", icon: Sparkles },
];

const TONES = ["Confident", "Friendly", "Witty", "Professional", "Playful"];

const SAMPLES = [
  "✨ Real talk from Maya R.: \"Best onboarding I've ever experienced — the team replies in minutes.\"\n\nThat's the bar. ⚡\n\n#CustomerLove #SaaS #ReevoAI",
  "We just turned 1,284 reviews into 362 ready-to-post stories — automatically.\n\nNo writers. No designers. Just signal → content. 🚀",
  "Daniel K. shipped 8 reels from a single batch of reviews. Engagement doubled in two weeks.\n\nThis is what happens when your customers do the storytelling.",
];

function AIContent() {
  const [type, setType] = useState("caption");
  const [tone, setTone] = useState("Confident");
  const [prompt, setPrompt] = useState("Highlight customer wins from this week's 5-star reviews");
  const [out, setOut] = useState(SAMPLES[0]);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      setOut(SAMPLES[Math.floor(Math.random() * SAMPLES.length)]);
      setLoading(false);
      toast.success("Generated new content");
    }, 900);
  };

  return (
    <div>
      <PageHeader
        title="AI Content Studio"
        description="Generate captions, carousels, reels and quote graphics from your reviews."
        actions={
          <Button className="rounded-xl bg-[image:var(--gradient-primary)]" onClick={generate}>
            <Wand2 className="mr-2 h-4 w-4" /> Generate
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Brief</h2>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Format</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors ${
                  type === t.id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-secondary"
                }`}
              >
                <t.icon className="h-4 w-4 text-primary" />
                {t.label}
              </button>
            ))}
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Tone</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  tone === t ? "bg-[image:var(--gradient-primary)] text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Prompt</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-input bg-background/80 p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />

          <Button onClick={generate} disabled={loading} className="mt-4 w-full rounded-xl bg-[image:var(--gradient-primary)]">
            <Sparkles className="mr-2 h-4 w-4" /> {loading ? "Generating…" : "Generate variations"}
          </Button>
        </div>

        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Preview</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-lg" onClick={generate}>
                  <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }}>
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 to-[color:var(--accent-pink)]/30 p-6">
              <div className={`rounded-xl bg-background/80 p-5 text-sm leading-relaxed whitespace-pre-wrap ${loading ? "animate-pulse" : ""}`}>
                {out}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-background/70 px-2 py-1 font-medium">{type}</span>
                <span className="rounded-full bg-background/70 px-2 py-1 font-medium">{tone}</span>
                <span className="ml-auto">~{out.length} chars</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {SAMPLES.map((s, i) => (
              <button
                key={i}
                onClick={() => setOut(s)}
                className="glass rounded-2xl p-4 text-left text-xs text-muted-foreground transition-transform hover:-translate-y-0.5"
              >
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-primary">Variation {i + 1}</p>
                {s.slice(0, 110)}…
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}