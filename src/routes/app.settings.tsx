import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Instagram, Facebook, Linkedin, Youtube, Twitter, Check, Zap } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — ReevoAI" }] }),
  component: Settings,
});

const CHANNEL_ICONS: Record<string, typeof Instagram> = {
  Instagram,
  Facebook,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  X: Twitter,
};

type SettingsData = {
  brandName: string;
  brandVoice: string;
  defaultHashtags: string;
  autoPublisher: boolean;
  channels: { name: string; connected: boolean }[];
};

function Settings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<{ settings: SettingsData }>("/settings"),
  });

  const [form, setForm] = useState<SettingsData | null>(null);

  useEffect(() => {
    if (data?.settings) {
      setForm({ ...data.settings, autoPublisher: data.settings.autoPublisher ?? true });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<SettingsData>) =>
      api("/settings", { method: "PUT", json: payload }),
    onSuccess: () => {
      toast.success("Settings saved");
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const toggleChannel = (name: string) => {
    if (!form) return;
    const channels = form.channels.map((c) =>
      c.name === name ? { ...c, connected: !c.connected } : c,
    );
    setForm({ ...form, channels });
  };

  if (isLoading || !form) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div>
      <PageHeader title="Settings" description="Workspace, brand voice and connected channels." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Workspace</h2>
          <div className="mt-4 space-y-3 text-sm">
            <label className="block">
              <span className="text-xs font-medium uppercase text-muted-foreground">Brand name</span>
              <input
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-muted-foreground">Brand voice</span>
              <textarea
                value={form.brandVoice}
                onChange={(e) => setForm({ ...form, brandVoice: e.target.value })}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-muted-foreground">Default hashtags</span>
              <input
                value={form.defaultHashtags}
                onChange={(e) => setForm({ ...form, defaultHashtags: e.target.value })}
                className="mt-1 w-full rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
              />
            </label>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
              className="rounded-xl bg-[image:var(--gradient-primary)]"
            >
              Save changes
            </Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Auto publisher</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                When enabled, positive and mixed reviews are turned into scheduled posts automatically
                after submission. Negative reviews are skipped.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-4">
            <div>
              <p className="text-sm font-medium">Schedule posts from new reviews</p>
              <p className="text-xs text-muted-foreground">
                Posts go to your connected channels with AI captions and images.
              </p>
            </div>
            <Switch
              checked={form.autoPublisher}
              onCheckedChange={(checked) => setForm({ ...form, autoPublisher: checked })}
            />
          </div>
          <Button
            className="mt-4 rounded-xl"
            variant="outline"
            onClick={() => saveMutation.mutate({ autoPublisher: form.autoPublisher })}
            disabled={saveMutation.isPending}
          >
            Save auto publisher
          </Button>
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Connected channels</h2>
          <div className="mt-4 space-y-2">
            {form.channels.map((c) => {
              const Icon = CHANNEL_ICONS[c.name] ?? Instagram;
              return (
                <div key={c.name} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  {c.connected ? (
                    <button
                      type="button"
                      onClick={() => toggleChannel(c.name)}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600"
                    >
                      <Check className="h-3 w-3" /> Connected
                    </button>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toggleChannel(c.name)}>
                      Connect
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            className="mt-4 rounded-xl"
            variant="outline"
            onClick={() => saveMutation.mutate({ channels: form.channels })}
            disabled={saveMutation.isPending}
          >
            Save channel connections
          </Button>
        </div>
      </div>
    </div>
  );
}
