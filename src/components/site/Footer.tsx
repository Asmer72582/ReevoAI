import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Linkedin, Youtube, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-to-b from-background to-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold">Reevo<span className="text-primary">AI</span></span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Turn customer reviews into marketing content automatically with AI.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="glass flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:text-primary">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Integrations"] },
            { title: "Company", links: ["About", "Careers", "Contact"] },
            { title: "Resources", links: ["Blog", "Documentation", "Help Center"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l}><Link to="/" className="text-sm text-muted-foreground transition hover:text-foreground">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 ReevoAI. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}