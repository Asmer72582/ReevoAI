import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Instagram, Facebook, Linkedin, Youtube, Twitter, Check, ExternalLink, Zap } from "lucide-react";
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

type ChannelLinks = {
  name: string;
  connectUrl: string;
  deployUrl: string;
  helpText: string;
};

function Settings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api<{ settings: SettingsData }>("/settings"),
  });

  const { data: channelLinksData } = useQuery({
    queryKey: ["channel-links"],
    queryFn: () => api<{ channels: ChannelLinks[] }>("/channels/links"),
  });

  const [form, setForm] = useState<SettingsData | null>(null);
  const [connectingChannel, setConnectingChannel] = useState<string | null>(null);

  useEffect(() => {
    if (data?.settings) {
      setForm({ ...data.settings, autoPublisher: data.settings.autoPublisher ?? true });
    }
  }, [data]);

  const linkByChannel = new Map(channelLinksData?.channels.map((channel) => [channel.name, channel]) ?? []);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<SettingsData>) =>
      api("/settings", { method: "PUT", json: payload }),
    onSuccess: () => {
      toast.success("Settings saved");
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const connectChannel = async (name: string) => {
    setConnectingChannel(name);
    try {
      const result = await api<{
        connectUrl: string;
        deployUrl: string;
        helpText: string;
        publishedCount: number;
        settings: SettingsData;
      }>(`/channels/${encodeURIComponent(name)}/connect`, { method: "POST" });

      setForm((current) =>
        current
          ? {
              ...current,
              channels: current.channels.map((channel) =>
                channel.name === name ? { ...channel, connected: true } : channel,
              ),
            }
          : current,
      );

      window.open(result.connectUrl, "_blank", "noopener,noreferrer");

      toast.success(
        result.publishedCount > 0
          ? `${name} connected — ${result.publishedCount} scheduled post${result.publishedCount === 1 ? "" : "s"} deployed`
          : `${name} connected — finish setup in the new tab`,
        { description: result.helpText },
      );

      void queryClient.invalidateQueries({ queryKey: ["settings"] });
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch {
      toast.error(`Could not connect ${name}`);
    } finally {
      setConnectingChannel(null);
    }
  };

  const publishingDeployUrl = (channelName: string) =>
    `/app/publishing?tab=published&channel=${encodeURIComponent(channelName)}`;

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
          <p className="mt-1 text-sm text-muted-foreground">
            Click <span className="font-medium text-primary">Connect</span> to authorize a channel, deploy scheduled
            posts, and open the platform setup page.
          </p>
          <div className="mt-4 space-y-2">
            {form.channels.map((c) => {
              const Icon = CHANNEL_ICONS[c.name] ?? Instagram;
              const links = linkByChannel.get(c.name);
              const externalDeployUrl = links?.deployUrl ?? "#";
              const isConnecting = connectingChannel === c.name;

              return (
                <div
                  key={c.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    {c.connected ? (
                      <a
                        href={externalDeployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {c.name}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void connectChannel(c.name)}
                        disabled={isConnecting}
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
                      >
                        {c.name}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {c.connected ? (
                      <>
                        <Link
                          to={publishingDeployUrl(c.name)}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Deploy in ReevoAI
                        </Link>
                        <a
                          href={externalDeployUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 underline-offset-4 hover:underline"
                        >
                          <Check className="h-3 w-3" /> Connected · Open {c.name}
                        </a>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void connectChannel(c.name)}
                        disabled={isConnecting}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 disabled:opacity-60"
                      >
                        {isConnecting ? "Connecting…" : "Connect & deploy"}
                        {!isConnecting && <ExternalLink className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
