import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — ReevoAI" }, { name: "description", content: "Answers to common questions about the ReevoAI platform." }] }),
  component: FAQ,
});

const faqs = [
  { q: "How does AI analyze reviews?", a: "Our models detect sentiment, themes, and standout quotes — and use them to draft on-brand content automatically." },
  { q: "Can I approve content before posting?", a: "Yes. Every piece of generated content moves through an approval workflow where you can approve, edit, or reject." },
  { q: "Which social media platforms are supported?", a: "Instagram, Facebook, LinkedIn, YouTube, and X — with more on the way." },
  { q: "Can I generate videos automatically?", a: "Absolutely. AI-narrated testimonial videos with avatars, subtitles, and your branding — in minutes." },
  { q: "Is there a free trial?", a: "Yes — 14 days, no credit card required. Cancel anytime." },
];

function FAQ() {
  return (
    <main className="bg-hero-glow">
      <section className="mx-auto max-w-3xl px-4 py-20 md:py-28">
        <div className="text-center">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> FAQ</div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Frequently asked questions</h1>
        </div>
        <div className="glass mt-12 rounded-3xl p-2 md:p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`i-${i}`} className="border-border/60">
                <AccordionTrigger className="px-4 text-left font-display text-base font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  );
}