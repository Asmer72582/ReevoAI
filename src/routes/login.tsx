import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api-client";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sign in — ReevoAI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("demo@reevoai.com");
  const [password, setPassword] = useState("demo1234");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) {
      void navigate({ to: search.redirect ?? "/app", replace: true });
    }
  }, [ready, user, navigate, search.redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      void navigate({ to: search.redirect ?? "/app", replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Login failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-hero)] px-4">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">
            Reevo<span className="text-primary">AI</span>
          </span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage reviews, AI content, and publishing.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase text-muted-foreground">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase text-muted-foreground">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[image:var(--gradient-primary)]"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo: demo@reevoai.com / demo1234 · Backend: <code>npm run dev:api</code>
        </p>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
