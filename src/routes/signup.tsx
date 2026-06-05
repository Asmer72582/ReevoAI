import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api-client";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — ReevoAI" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { register, user, ready } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) {
      void navigate({ to: "/app", replace: true });
    }
  }, [ready, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(email, password, name);
      toast.success("Account created!");
      void navigate({ to: "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Signup failed — is npm run dev:api running?");
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
        <h1 className="mt-6 font-display text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start your 14-day free trial.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase text-muted-foreground">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background/80 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium uppercase text-muted-foreground">Email</span>
            <input
              type="email"
              required
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
              minLength={6}
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
            {submitting ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
