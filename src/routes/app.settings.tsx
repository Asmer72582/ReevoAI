import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Linkedin, Youtube, Twitter, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — ReevoAI" }] }),
  component: Settings,
});

const channels = [
  { name: "Instagram", icon: Instagram, connected: true },
  { name: "Facebook", icon: Facebook, connected: true },
  { name: "LinkedIn", icon: Linkedin, connected: true },
  { name: "YouTube", icon: Youtube, connected: false },
  { name: "X", icon: Twitter, connected: true },
];

function Settings() {
  return (
    <div>
      <PageHeader title="Settings" description="Workspace, brand voice and connected channels." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Workspace</h2>
          <div className="mt-4 space-y-3 text-sm">
            <label className="block">
              <span className="text-xs font-medium uppercase text-muted-foreground">Brand name</span>
              <input defaultValue="ReevoAI" className="mt-1 w-full rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40" />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-muted-foreground">Brand voice</span>
              <textarea defaultValue="Confident, friendly, slightly witty. Short sentences. Customer-first." rows={3} className="mt-1 w-full resize-none rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40" />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-muted-foreground">Default hashtags</span>
              <input defaultValue="#SaaS #CustomerLove #ReevoAI" className="mt-1 w-full rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40" />
            </label>
            <Button onClick={() => toast.success("Settings saved")} className="rounded-xl bg-[image:var(--gradient-primary)]">Save changes</Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold">Connected channels</h2>
          <div className="mt-4 space-y-2">
            {channels.map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                    <c.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
                {c.connected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    <Check className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <Button size="sm" variant="outline" className="rounded-lg">Connect</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}