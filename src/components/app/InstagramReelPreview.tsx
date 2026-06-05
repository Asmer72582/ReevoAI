import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bookmark,
  Heart,
  Instagram,
  MessageCircle,
  Music2,
  Send,
  Video,
} from "lucide-react";
import type { InstagramPreviewPost } from "./InstagramPosterPreview";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: InstagramPreviewPost | null;
};

export function InstagramReelPreview({ open, onOpenChange, post }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!post) return null;

  const username = (post.brandName ?? "reevoai").toLowerCase().replace(/\s+/g, "");
  const caption = post.content?.trim() || post.reelScript?.trim() || post.title;
  const videoUrl = post.videoUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] gap-0 overflow-hidden rounded-3xl border-0 p-0 sm:max-w-[380px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Instagram reel preview</DialogTitle>
          <DialogDescription>Preview generated reel video on Instagram</DialogDescription>
        </DialogHeader>

        <div className="bg-black">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-[#E1306C]" />
              <span className="text-xs font-semibold text-white">Reels</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-white/60">
              <Video className="h-3 w-3" /> Reel preview
            </span>
          </div>

          <div className="relative mx-auto aspect-[9/16] w-full max-h-[520px] overflow-hidden bg-black">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="h-full w-full object-cover"
                playsInline
                loop
                muted
                autoPlay
                controls
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <Video className="h-10 w-10 text-white/40" />
                <p className="text-sm font-medium text-white/80">No reel video yet</p>
                <p className="text-xs text-white/50">Generate a reel from the review first</p>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

            <div className="pointer-events-none absolute bottom-20 right-3 flex flex-col items-center gap-4">
              <Heart className="h-6 w-6 text-white" strokeWidth={1.5} />
              <MessageCircle className="h-6 w-6 text-white" strokeWidth={1.5} />
              <Send className="h-6 w-6 text-white" strokeWidth={1.5} />
              <Bookmark className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] p-[1.5px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                    {username.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <span className="text-xs font-semibold text-white">{username}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-white/90">{caption}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/70">
                <Music2 className="h-3 w-3" />
                <span className="truncate">Original audio · {post.brandName ?? "ReevoAI"}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
