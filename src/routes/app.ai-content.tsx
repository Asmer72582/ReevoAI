import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Wand2, Video, Image as ImageIcon, FileText, Copy, RefreshCw, Download, Instagram } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { InstagramPosterPreview } from "@/components/app/InstagramPosterPreview";
import { InstagramReelPreview } from "@/components/app/InstagramReelPreview";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

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

function extractHeadline(content: string): string {
  const noTags = content.replace(/#\w+/g, "").trim();
  const first = noTags.split(/[.!?\n]/)[0]?.trim() ?? noTags;
  return first.length <= 140 ? first : first.slice(0, 137) + "…";
}

function extractHashtags(content: string, fallback?: string): string {
  const tags = content.match(/#\w+/g);
  if (tags?.length) return tags.join(" ");
  return fallback?.trim() || "#CustomerLove #ReevoAI #Testimonial";
}

function AIContent() {
  const [type, setType] = useState("caption");
  const [tone, setTone] = useState("Confident");
  const [prompt, setPrompt] = useState("Highlight customer wins from this week's 5-star reviews");
  const [out, setOut] = useState("");
  const [variations, setVariations] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"gemini" | "poster" | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [igPreviewOpen, setIgPreviewOpen] = useState(false);
  const [reelPreviewOpen, setReelPreviewOpen] = useState(false);
  const [reelVideoUrl, setReelVideoUrl] = useState<string | null>(null);
  const [reelScript, setReelScript] = useState<string | null>(null);
  const [reelLoading, setReelLoading] = useState(false);

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<{ settings: { brandName: string; defaultHashtags: string } }>("/settings"),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      api<{ reviews: { id: string; text: string; name: string; stars: number; reelVideoUrl?: string; reelScript?: string }[] }>("/reviews"),
    enabled: type === "reel",
  });

  const brandName = settingsData?.settings.brandName ?? "ReevoAI";
  const defaultHashtags = settingsData?.settings.defaultHashtags;
  const latestReview = reviewsData?.reviews[0];

  const previewPost = out
    ? {
        title: extractHeadline(out),
        content: out,
        when: "Just now",
        brandName,
        hashtags: extractHashtags(out, defaultHashtags),
        imageUrl: imageUrl ?? undefined,
        reviewText: latestReview?.text,
        reviewName: latestReview?.name,
        reviewStars: latestReview?.stars ?? null,
        videoUrl: reelVideoUrl ?? latestReview?.reelVideoUrl,
        reelScript: reelScript ?? latestReview?.reelScript ?? out,
      }
    : null;

  const generateReelVideo = async () => {
    if (!latestReview?.id) {
      toast.error("Add a customer review first");
      return;
    }
    setReelLoading(true);
    try {
      const res = await api<{ videoUrl: string; script: string; aiSource: string }>(
        `/reviews/${latestReview.id}/generate-reel`,
        { method: "POST" },
      );
      setReelVideoUrl(res.videoUrl);
      setReelScript(res.script);
      toast.success("Reel video ready — open Reel Preview");
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch {
      toast.error("Reel generation failed");
    } finally {
      setReelLoading(false);
    }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const result = await api<{
        content: string;
        variations: string[];
        source: "gemini" | "fallback";
        model?: string;
        fallbackReason?: "quota_exceeded" | "api_error" | "no_key";
        imageUrl?: string;
        imageSource?: "gemini" | "poster";
      }>("/ai/generate", { method: "POST", json: { type, tone, prompt } });
      setOut(result.content);
      setVariations(result.variations);
      setImageUrl(result.imageUrl ?? null);
      setImageSource(result.imageSource ?? null);
      if (result.source === "gemini") {
        toast.success("Generated with Gemini");
      } else if (result.fallbackReason === "quota_exceeded") {
        toast.warning("Gemini quota exceeded — used fallback templates");
      } else if (result.fallbackReason === "no_key") {
        toast.info("Using fallback templates (no API key)");
      } else {
        toast.info("Generated with fallback templates");
      }
      if (result.imageUrl) {
        toast.success(
          result.imageSource === "gemini" ? "AI image generated" : "Post graphic created",
        );
      }
    } catch {
      toast.error("Generation failed — is the API server running?");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reevoai-${type}-post.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Content Studio"
        description="Generate captions, carousels, reels and quote graphics from your reviews."
        actions={
          <Button className="rounded-xl bg-[image:var(--gradient-primary)]" onClick={() => void generate()}>
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
            className="mt-2 w-full resize-none rounded-xl border border-input bg-background/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />

          <Button onClick={() => void generate()} disabled={loading} className="mt-4 w-full rounded-xl bg-[image:var(--gradient-primary)]">
            <Sparkles className="mr-2 h-4 w-4" /> {loading ? "Generating…" : type === "reel" ? "Generate reel script" : "Generate text + image"}
          </Button>

          {type === "reel" && (
            <Button
              onClick={() => void generateReelVideo()}
              disabled={reelLoading || !latestReview}
              variant="outline"
              className="mt-2 w-full rounded-xl border-violet-500/40 text-violet-700 hover:bg-violet-500/10"
            >
              <Video className="mr-2 h-4 w-4" /> {reelLoading ? "Building video…" : reelVideoUrl || latestReview?.reelVideoUrl ? "Regenerate reel video" : "Generate reel video"}
            </Button>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {type === "reel" && (reelVideoUrl || latestReview?.reelVideoUrl) && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">Reel video</h2>
                  <p className="text-xs text-muted-foreground">8s vertical reel · review → script → avatar → reel</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-[#E1306C]/30 text-[#E1306C] hover:bg-[#E1306C]/10"
                  onClick={() => setReelPreviewOpen(true)}
                >
                  <Video className="mr-1 h-3 w-3" /> Reel Preview
                </Button>
              </div>
              <div className="mx-auto max-w-[220px] overflow-hidden rounded-2xl border border-border/60 bg-black">
                <video
                  src={reelVideoUrl ?? latestReview?.reelVideoUrl}
                  className="aspect-[9/16] w-full object-cover"
                  playsInline
                  loop
                  muted
                  autoPlay
                  controls
                />
              </div>
            </div>
          )}
          {imageUrl && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold">Post image</h2>
                  <p className="text-xs text-muted-foreground">
                    {imageSource === "gemini" ? "AI-generated graphic" : "Branded poster graphic"} · 1080×1080
                  </p>
                </div>
                <div className="flex gap-2">
                  {type === "reel" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-[#E1306C]/30 text-[#E1306C] hover:bg-[#E1306C]/10"
                      onClick={() => setReelPreviewOpen(true)}
                      disabled={!out}
                    >
                      <Video className="mr-1 h-3 w-3" /> Reel Preview
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-[#E1306C]/30 text-[#E1306C] hover:bg-[#E1306C]/10"
                      onClick={() => setIgPreviewOpen(true)}
                    >
                      <Instagram className="mr-1 h-3 w-3" /> IG Preview
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => void downloadImage()}>
                    <Download className="mr-1 h-3 w-3" /> Download
                  </Button>
                </div>
              </div>
              <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-border/60 shadow-lg">
                <img src={imageUrl} alt="Generated post graphic" className="aspect-square w-full object-cover" />
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Caption preview</h2>
              <div className="flex gap-2">
                {out && type === "reel" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-[#E1306C]/30 text-[#E1306C] hover:bg-[#E1306C]/10"
                    onClick={() => setReelPreviewOpen(true)}
                  >
                    <Video className="mr-1 h-3 w-3" /> Reel Preview
                  </Button>
                )}
                {out && type !== "reel" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-[#E1306C]/30 text-[#E1306C] hover:bg-[#E1306C]/10"
                    onClick={() => setIgPreviewOpen(true)}
                  >
                    <Instagram className="mr-1 h-3 w-3" /> IG Preview
                  </Button>
                )}
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => void generate()} disabled={loading}>
                  <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  disabled={!out}
                  onClick={() => {
                    void navigator.clipboard.writeText(out);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 to-[color:var(--accent-pink)]/30 p-6">
              <div className={`rounded-xl bg-background/80 p-5 text-sm leading-relaxed whitespace-pre-wrap min-h-[120px] ${loading ? "animate-pulse" : ""}`}>
                {out || (loading ? "Generating…" : "Click Generate to create content with Gemini.")}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-background/70 px-2 py-1 font-medium">{type}</span>
                <span className="rounded-full bg-background/70 px-2 py-1 font-medium">{tone}</span>
                {out && <span className="ml-auto">~{out.length} chars</span>}
              </div>
            </div>
          </div>

          {variations.length > 0 && (
            <div className="grid gap-3 md:grid-cols-3">
              {variations.map((s, i) => (
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
          )}
        </div>
      </div>

      <InstagramPosterPreview open={igPreviewOpen} onOpenChange={setIgPreviewOpen} post={previewPost} />
      <InstagramReelPreview open={reelPreviewOpen} onOpenChange={setReelPreviewOpen} post={previewPost} />
    </div>
  );
}
