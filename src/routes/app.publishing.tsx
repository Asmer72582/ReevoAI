import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Plus,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Clock,
  CheckCircle2,
  Sparkles,
  Star,
  Layers,
  Pencil,
  Trash2,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { InstagramPosterPreview } from "@/components/app/InstagramPosterPreview";
import { InstagramReelPreview } from "@/components/app/InstagramReelPreview";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/publishing")({
  head: () => ({ meta: [{ title: "Publishing — ReevoAI" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as "scheduled" | "published" | "draft" | undefined) ?? undefined,
    highlight: (search.highlight as string | undefined) ?? undefined,
  }),
  component: Publishing,
});

const ICONS = { Instagram, Facebook, LinkedIn: Linkedin, YouTube: Youtube, X: Twitter };

type Post = {
  id: string;
  title: string;
  content?: string;
  channels: (keyof typeof ICONS)[];
  status: "scheduled" | "published" | "draft";
  when: string;
  reviewId?: string | null;
  reviewName?: string;
  reviewStars?: number | null;
  imageUrl?: string;
  imageUrls?: string[];
  reviewText?: string;
  imageSource?: string;
  aiSource?: string;
  videoUrl?: string;
  reelScript?: string;
};

const tabs = [
  { id: "scheduled", label: "Scheduled", icon: Clock },
  { id: "published", label: "Published", icon: CheckCircle2 },
  { id: "draft", label: "Drafts", icon: Pencil },
] as const;

function extractHashtags(content: string, fallback?: string): string {
  const tags = content.match(/#\w+/g);
  if (tags?.length) return tags.join(" ");
  return fallback?.trim() || "#CustomerLove #ReevoAI #Testimonial";
}

function PostCard({
  post,
  highlighted,
  onPreview,
  onReelPreview,
  onDelete,
  deleting,
}: {
  post: Post;
  highlighted: boolean;
  onPreview: (post: Post) => void;
  onReelPreview: (post: Post) => void;
  onDelete: (post: Post) => void;
  deleting: boolean;
}) {
  const hasInstagram = post.channels.includes("Instagram");
  const cover = post.imageUrls?.[0] ?? post.imageUrl;
  const slideCount = post.imageUrls?.length ?? (post.imageUrl ? 1 : 0);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-background/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
        highlighted ? "ring-2 ring-primary/60" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => hasInstagram && onPreview(post)}
        className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/20 via-[color:var(--accent-pink)]/20 to-primary/10"
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/50 backdrop-blur-sm">
              {post.status === "published" ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              ) : (
                <Clock className="h-7 w-7 text-primary" />
              )}
            </div>
            <p className="font-display text-sm font-semibold text-foreground/80">{post.title}</p>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${
              post.status === "published"
                ? "bg-emerald-500/90 text-white"
                : post.status === "scheduled"
                  ? "bg-amber-500/90 text-white"
                  : "bg-black/55 text-white"
            }`}
          >
            {post.status}
          </span>
          {slideCount > 1 && (
            <span className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
              <Layers className="h-3 w-3" />
              {slideCount}
            </span>
          )}
        </div>

        {hasInstagram && cover && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Instagram className="h-3.5 w-3.5" /> Tap to preview
            </span>
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.reviewId && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              From review
            </span>
          )}
          {post.aiSource === "gemini" && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              AI caption
            </span>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-sm font-semibold leading-snug">{post.title}</h3>

        {post.reviewName && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {post.reviewStars ? (
              <div className="flex">
                {Array.from({ length: post.reviewStars }).map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            ) : null}
            <span>{post.reviewName}</span>
          </div>
        )}

        {post.content && (
          <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">{post.content}</p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-1">
            {post.channels.map((c) => {
              const Icon = ICONS[c] ?? Instagram;
              return (
                <div
                  key={c}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-primary"
                >
                  <Icon className="h-3 w-3" />
                </div>
              );
            })}
            <span className="ml-1 text-[10px] text-muted-foreground">{post.when}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {hasInstagram ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 min-w-0 flex-1 rounded-lg border-[#E1306C]/30 text-[11px] text-[#E1306C] hover:bg-[#E1306C]/10"
                onClick={() => onPreview(post)}
              >
                <Instagram className="mr-1 h-3 w-3" />
                IG Preview
              </Button>
              {post.reviewId && post.videoUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 min-w-0 flex-1 rounded-lg border-violet-500/30 text-[11px] text-violet-600 hover:bg-violet-500/10"
                  onClick={() => onReelPreview(post)}
                >
                  <Video className="mr-1 h-3 w-3" />
                  Reel Preview
                </Button>
              )}
            </>
          ) : (
            <Button size="sm" variant="outline" className="h-8 flex-1 rounded-lg text-[11px]" disabled>
              Preview
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-8 rounded-lg px-3 text-[11px]">
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg px-2.5 text-[11px] text-destructive hover:bg-destructive/10"
            disabled={deleting}
            onClick={() => onDelete(post)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function Publishing() {
  const search = useSearch({ from: "/app/publishing" });
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>(search.tab ?? "scheduled");
  const [newTitle, setNewTitle] = useState("");
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [reelPreviewPost, setReelPreviewPost] = useState<Post | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(search.highlight ?? null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (search.tab) setTab(search.tab);
    if (search.highlight) setHighlightId(search.highlight);
  }, [search.tab, search.highlight]);

  const { data, isLoading } = useQuery({
    queryKey: ["posts", tab],
    queryFn: () => api<{ posts: Post[]; weekCounts: number[] }>(`/posts?status=${tab}`),
  });

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<{ settings: { brandName: string; defaultHashtags: string } }>("/settings"),
  });

  const createMutation = useMutation({
    mutationFn: (title: string) =>
      api("/posts", {
        method: "POST",
        json: { title, status: "scheduled", channels: ["Instagram"] },
      }),
    onSuccess: () => {
      toast.success("Post scheduled");
      setNewTitle("");
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      setTab("scheduled");
      void navigate({ to: "/app/publishing", search: { tab: "scheduled" }, replace: true });
    },
    onError: () => toast.error("Failed to create post"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/posts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Post deleted");
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const handleDelete = (post: Post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    deleteMutation.mutate(post.id);
  };

  const openPreview = (post: Post) => {
    if (!post.channels.includes("Instagram")) {
      toast.info("Instagram preview is available for posts scheduled to Instagram");
      return;
    }
    setPreviewPost(post);
  };

  const openReelPreview = (post: Post) => {
    setReelPreviewPost(post);
  };

  const toPreviewPayload = (p: Post) => ({
    title: p.title,
    content: p.content,
    when: p.when,
    brandName,
    hashtags: extractHashtags(p.content ?? "", defaultHashtags),
    imageUrl: p.imageUrl,
    imageUrls: p.imageUrls,
    reviewText: p.reviewText,
    reviewName: p.reviewName,
    reviewStars: p.reviewStars,
    videoUrl: p.videoUrl,
    reelScript: p.reelScript,
  });

  const list = data?.posts ?? [];
  const counts = data?.weekCounts ?? [0, 0, 0, 0, 0, 0, 0];
  const brandName = settingsData?.settings.brandName ?? "ReevoAI";
  const defaultHashtags = settingsData?.settings.defaultHashtags;
  const totalQueued = counts.reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader
        title="Publishing"
        description="Visual queue for every post — preview, edit and publish across channels."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <Calendar className="mr-2 h-4 w-4" /> Calendar
            </Button>
            <Button
              className="rounded-xl bg-[image:var(--gradient-primary)]"
              onClick={() => {
                const title = newTitle || prompt("Post title?");
                if (title) createMutation.mutate(title);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> New post
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">This week</p>
          <p className="mt-1 font-display text-2xl font-semibold">{totalQueued}</p>
          <p className="text-xs text-muted-foreground">posts queued</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{tabs.find((t) => t.id === tab)?.label}</p>
          <p className="mt-1 font-display text-2xl font-semibold">{list.length}</p>
          <p className="text-xs text-muted-foreground">in this tab</p>
        </div>
        <div className="glass rounded-2xl p-4 sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Quick schedule</p>
          <div className="mt-2 flex gap-2">
            <input
              placeholder="Post title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && newTitle && createMutation.mutate(newTitle)}
              className="min-w-0 flex-1 rounded-xl border border-input bg-background/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <Button
              size="sm"
              className="shrink-0 rounded-xl bg-[image:var(--gradient-primary)]"
              disabled={!newTitle || createMutation.isPending}
              onClick={() => createMutation.mutate(newTitle)}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                void navigate({ to: "/app/publishing", search: { tab: t.id }, replace: true });
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-sm"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="font-display text-lg font-semibold">No {tab} posts yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Reviews submitted via your review link appear here automatically as scheduled posts.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              highlighted={highlightId === p.id}
              onPreview={openPreview}
              onReelPreview={openReelPreview}
              onDelete={handleDelete}
              deleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      <InstagramPosterPreview
        open={previewPost !== null}
        onOpenChange={(open) => !open && setPreviewPost(null)}
        post={previewPost ? toPreviewPayload(previewPost) : null}
      />
      <InstagramReelPreview
        open={reelPreviewPost !== null}
        onOpenChange={(open) => !open && setReelPreviewPost(null)}
        post={reelPreviewPost ? toPreviewPayload(reelPreviewPost) : null}
      />
    </div>
  );
}
