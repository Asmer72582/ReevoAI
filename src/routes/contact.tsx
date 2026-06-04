import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, MessageCircle, Sparkles, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — ReevoAI" }, { name: "description", content: "Talk to our team or schedule a personalized demo." }] }),
  component: Contact,
});

function Contact() {
  const [chat, setChat] = useState(false);
  return (
    <main className="bg-hero-glow">
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Contact</div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Let's build your AI marketing engine</h1>
          <p className="mt-3 text-muted-foreground">Tell us about your business — we'll show you what's possible.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <form onSubmit={(e)=>{e.preventDefault();toast.success("Message sent! We'll get back within 24h.");}}
            className="glass space-y-4 rounded-3xl p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Your name"><Input required placeholder="Aarav Patel" /></Field>
              <Field label="Business name"><Input required placeholder="Brew Lab Café" /></Field>
              <Field label="Email"><Input required type="email" placeholder="you@business.com" /></Field>
              <Field label="Phone"><Input placeholder="+91 98xxxxxx" /></Field>
            </div>
            <Field label="How can we help?"><Textarea required rows={5} placeholder="Tell us about your goals..." /></Field>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" className="rounded-xl bg-[image:var(--gradient-primary)] px-6 shadow-[var(--shadow-elegant)]">Send message</Button>
              <Button type="button" variant="outline" className="rounded-xl"><Calendar className="mr-2 h-4 w-4" />Schedule a demo</Button>
            </div>
          </form>
          <div className="space-y-4">
            <InfoCard icon={Mail} label="Email" value="hello@reevo.ai" />
            <InfoCard icon={Phone} label="Phone" value="+91 90000 00000" />
            <div className="glass rounded-3xl p-6">
              <h4 className="font-display font-semibold">Why teams choose us</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• 24-hour response guarantee</li>
                <li>• Free onboarding & migration</li>
                <li>• Cancel anytime, no lock-in</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Live chat widget */}
      <button onClick={()=>setChat(!chat)} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
        <MessageCircle className="h-6 w-6" />
      </button>
      {chat && (
        <div className="glass fixed bottom-24 right-6 z-50 w-80 rounded-3xl p-4 shadow-[var(--shadow-elegant)]">
          <p className="font-display font-semibold">Hi 👋 How can we help?</p>
          <p className="mt-1 text-xs text-muted-foreground">Average reply time: 2 minutes.</p>
          <Input className="mt-3" placeholder="Type a message..." />
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-semibold">{label}</Label>{children}</div>;
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass flex items-center gap-3 rounded-3xl p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]"><Icon className="h-5 w-5 text-primary-foreground" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold">{value}</p></div>
    </div>
  );
}