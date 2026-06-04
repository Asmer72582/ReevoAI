import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — ReevoAI" }, { name: "description", content: "Simple, transparent pricing for businesses of every size." }] }),
  component: Pricing,
});

const plans = [
  { name: "Starter", price: "₹999", period: "/month", desc: "For new businesses testing the waters.", features: ["100 reviews / month","Basic AI content","1 social account","Email support"], highlight: false },
  { name: "Growth", price: "₹2,999", period: "/month", desc: "For growing brands ready to scale content.", features: ["1,000 reviews / month","AI testimonial videos","Multi-platform publishing","Approval workflow","Priority support"], highlight: true },
  { name: "Enterprise", price: "Custom", period: "", desc: "For agencies and large teams.", features: ["Unlimited reviews","White label","API access","Dedicated CSM","SLA & SSO"], highlight: false },
];

function Pricing() {
  return (
    <main className="bg-hero-glow">
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Pricing</div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Plans that grow with you</h1>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you're ready. Cancel anytime.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className={`relative rounded-3xl p-7 ${p.highlight ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]" : "glass"}`}>
              {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow">Most popular</div>}
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.period}</span>
              </div>
              <p className={`mt-2 text-sm ${p.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.desc}</p>
              <Button className={`mt-6 w-full rounded-xl ${p.highlight ? "bg-white text-primary hover:bg-white/90" : "bg-[image:var(--gradient-primary)]"}`}>
                {p.name === "Enterprise" ? "Contact sales" : "Start free trial"}
              </Button>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f)=>(
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className={`h-4 w-4 ${p.highlight ? "text-white" : "text-primary"}`} />{f}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}