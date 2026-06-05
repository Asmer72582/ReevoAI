import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { Bell, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoredToken } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — ReevoAI" },
      { name: "description", content: "Manage reviews, AI content, publishing and analytics." },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getStoredToken()) {
      throw redirect({ to: "/login", search: { redirect: window.location.pathname } });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const { user, logout, loading } = useAuth();
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[image:var(--gradient-hero)]">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="ml-2 hidden flex-1 items-center gap-2 md:flex">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search reviews, posts, customers…"
                  className="h-9 w-full rounded-xl border border-input bg-background/80 pl-9 pr-3 text-sm outline-none ring-ring/40 focus:ring-2"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Link to="/" className="hidden text-xs font-medium text-muted-foreground hover:text-foreground md:inline">
                Back to site
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                title="Sign out"
                onClick={() => void logout().then(() => (window.location.href = "/login"))}
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-semibold text-primary-foreground"
                title={user?.name ?? (loading ? "Loading…" : "User")}
              >
                {initials}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}