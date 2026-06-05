import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QueryState({
  loading,
  error,
  empty,
  onRetry,
  children,
}: {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-destructive">Could not load data</p>
            <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Start the API: <code className="rounded bg-secondary px-1">npm run dev:api</code>
              {" · "}
              If it still hangs: <code className="rounded bg-secondary px-1">lsof -i :3001</code> and kill stuck
              processes.
            </p>
            {onRetry && (
              <Button size="sm" variant="outline" className="mt-4 rounded-lg" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-border/60 p-8 text-center text-sm text-muted-foreground">
        No data yet.
      </div>
    );
  }

  return <>{children}</>;
}
