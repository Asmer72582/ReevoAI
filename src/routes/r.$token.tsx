import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Sparkles, Star, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, fetchPublicReviewForm, submitPublicReview } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/r/$token")({
  head: () => ({ meta: [{ title: "Leave a review — ReevoAI" }] }),
  component: PublicReviewPage,
});

function PublicReviewPage() {
  const { token } = Route.useParams();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-review", token],
    queryFn: () => fetchPublicReviewForm(token),
  });

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const onPickImages = (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...images, ...Array.from(files)].slice(0, 5);
    setImages(next);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitPublicReview(token, { name, text, stars, images });
      setDone(true);
      toast.success("Thank you! Your review was submitted.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-hero)] px-4 text-sm text-muted-foreground">
        Loading review form…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-hero)] px-4">
        <div className="glass max-w-md rounded-3xl p-8 text-center">
          <p className="font-semibold text-destructive">Link not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {(error as Error)?.message ?? "This review link is invalid or expired."}
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-hero)] px-4">
        <div className="glass max-w-md rounded-3xl p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Thank you!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your review for {data?.brandName} was received{images.length ? " with photos" : ""}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-hero)] px-4 py-10">
      <div className="glass w-full max-w-lg rounded-3xl p-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">{data?.brandName}</p>
            <p className="text-xs text-muted-foreground">{data?.label ?? "Share your experience"}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase text-muted-foreground">Your name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="Maya Rodriguez"
            />
          </label>

          <div>
            <span className="text-xs font-medium uppercase text-muted-foreground">Rating</span>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  className="rounded-lg p-1 transition-transform hover:scale-110"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`h-7 w-7 ${n <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm">
            <span className="text-xs font-medium uppercase text-muted-foreground">Your review</span>
            <textarea
              required
              minLength={10}
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 w-full resize-none rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="Tell us about your experience…"
            />
          </label>

          <div>
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Photos <span className="normal-case text-muted-foreground">(optional, up to 5)</span>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onPickImages(e.target.files)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div key={src} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border/60">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground hover:bg-secondary/50"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="mt-1 text-[10px]">Add</span>
                </button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[image:var(--gradient-primary)]"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      </div>
    </div>
  );
}
