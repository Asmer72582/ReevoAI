export function formatWhen(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
  const now = new Date();
  const dayDiff = Math.floor((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (dayDiff === 0) return `Today · ${time}`;
  if (dayDiff === 1) return `Tomorrow · ${time}`;
  if (dayDiff === -1) return `Yesterday · ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` · ${time}`;
}
