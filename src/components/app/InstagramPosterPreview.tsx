import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  Instagram,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";

export type InstagramPreviewPost = {
  title: string;
  content?: string;
  when?: string;
  brandName?: string;
  hashtags?: string;
  imageUrl?: string;
  imageUrls?: string[];
  reviewText?: string;
  reviewName?: string;
  reviewStars?: number | null;
  videoUrl?: string;
  reelScript?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: InstagramPreviewPost | null;
};

export function InstagramPosterPreview({ open, onOpenChange, post }: Props) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    setSlide(0);
  }, [post?.imageUrls, post?.imageUrl, open]);

  if (!post) return null;

  const username = (post.brandName ?? "reevoai").toLowerCase().replace(/\s+/g, "");
  const caption = post.content?.trim() || post.title;
  const hashtags = post.hashtags?.trim() || "#CustomerLove #ReevoAI #Testimonial";
  const slides =
    post.imageUrls?.length ? post.imageUrls : post.imageUrl ? [post.imageUrl] : [];
  const isCarousel = slides.length > 1;
  const current = slides[slide] ?? slides[0];

  const prev = () => setSlide((s) => (s <= 0 ? slides.length - 1 : s - 1));
  const next = () => setSlide((s) => (s >= slides.length - 1 ? 0 : s + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] gap-0 overflow-hidden rounded-3xl border-0 p-0 sm:max-w-[420px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Instagram poster preview</DialogTitle>
          <DialogDescription>Preview how this post will look on Instagram</DialogDescription>
        </DialogHeader>

        <div className="bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between border-b border-black/5 px-3 py-2.5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-[#E1306C]" />
              <span className="text-sm font-semibold tracking-tight">Instagram</span>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {isCarousel ? `Carousel · ${slides.length} slides` : "Poster preview"}
            </span>
          </div>

          <div className="bg-white dark:bg-[#121212]">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#8134af] dark:bg-[#121212]">
                  {username.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{username}</p>
                <p className="text-[10px] text-muted-foreground">Sponsored · {post.when ?? "Scheduled"}</p>
              </div>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb]">
              {current ? (
                <img src={current} alt={`Slide ${slide + 1}`} className="h-full w-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.25),transparent_50%)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-lg text-white">★</span>
                    </div>
                    <p className="font-display text-lg font-bold leading-snug text-white drop-shadow-md md:text-xl">
                      "{post.reviewText ?? post.title}"
                    </p>
                    <p className="mt-3 text-xs font-medium text-white/80">— Customer testimonial</p>
                  </div>
                </>
              )}

              {isCarousel && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/65"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/65"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSlide(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === slide ? "w-3 bg-white" : "w-1.5 bg-white/40"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                  <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
                    {slide + 1}/{slides.length}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-3.5">
                <Heart className="h-6 w-6" strokeWidth={1.5} />
                <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
                <Send className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <Bookmark className="h-6 w-6" strokeWidth={1.5} />
            </div>

            <p className="px-3 text-xs font-semibold">1,284 likes</p>

            <div className="px-3 pb-1 pt-1">
              <p className="text-xs leading-relaxed">
                <span className="font-semibold">{username}</span>{" "}
                {caption.length > 160 ? caption.slice(0, 160) + "…" : caption}
              </p>
              <p className="mt-0.5 text-xs text-[#00376b] dark:text-[#6eb5ff]">{hashtags}</p>
            </div>

            <p className="px-3 pb-3 text-[10px] uppercase tracking-wide text-muted-foreground">
              {post.when ?? "Just now"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
