import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Play, Star, MessageSquare, Brain, Wand2, Video, CheckCircle2, Share2,
  Instagram, Facebook, Linkedin, Youtube, Twitter, ArrowRight, TrendingUp, Heart,
  Eye, Users, LayoutDashboard, FileText, BarChart3, Settings, Bell, Search,
  Mic, Camera, ThumbsUp, Zap, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReevoAI — Turn Reviews Into Marketing Content Automatically" },
      { name: "description", content: "Collect reviews, generate AI captions & testimonial videos, and auto-publish across Instagram, Facebook, LinkedIn, YouTube and X." },
    ],
  }),
  component: Landing,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mx-auto w-full max-w-6xl px-4 py-20 md:py-28 ${className}`}>{children}</section>;
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

function Landing() {
  return (
    <main className="relative overflow-hidden">
      {/* Hero */}
      <div className="relative bg-hero-glow">
        <Section className="!pt-12 md:!pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Reviews → Auto Marketing
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Turn Customer Reviews Into <span className="text-gradient">Powerful Marketing Content</span> Automatically
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Collect reviews, generate AI content, create testimonial videos, and publish across social media platforms — on autopilot.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" className="rounded-2xl bg-[image:var(--gradient-primary)] px-6 shadow-[var(--shadow-elegant)]">
                  Start Free Trial <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-2xl border-border/70 bg-white/60 px-6 backdrop-blur">
                  <Play className="mr-1 h-4 w-4" /> Watch Demo
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {["#fda4af","#93c5fd","#c4b5fd","#fcd34d"].map((c,i)=>(
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <div className="flex text-accent-pink-strong">{[...Array(5)].map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div>
                  <p className="text-xs">Loved by 2,400+ businesses</p>
                </div>
              </div>
            </motion.div>
            <HeroVisual />
          </div>
        </Section>
      </div>

      {/* Trusted */}
      <Section className="!py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Trusted by modern businesses</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-6">
          {["Restaurants","Clinics","Coaching","Gyms","Hotels","Local Biz"].map((t,i)=>(
            <motion.div key={t} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}
              className="glass flex items-center justify-center rounded-2xl py-5 text-sm font-semibold text-muted-foreground">
              {t}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Problem */}
      <Section>
        <SectionHeading eyebrow="The Problem" title="Stop wasting hours on manual marketing" subtitle="From scattered reviews to scroll-stopping content — without the grunt work." />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="glass rounded-3xl p-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">Without ReevoAI</div>
            <ul className="mt-5 space-y-3">
              {["Manual review collection","Manual content creation","Tedious video editing","Posting on each platform"].map((t)=>(
                <li key={t} className="flex items-center gap-3 text-sm"><X className="h-5 w-5 rounded-full bg-destructive/10 p-1 text-destructive" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[image:var(--gradient-soft)] p-7 shadow-[var(--shadow-elegant)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">With ReevoAI</div>
            <ul className="mt-5 space-y-3">
              {["AI Review Analysis","Auto Content Creation","AI Video Generation","Auto Social Publishing"].map((t)=>(
                <li key={t} className="flex items-center gap-3 text-sm font-medium"><Check className="h-5 w-5 rounded-full bg-primary p-1 text-primary-foreground" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section>
        <SectionHeading eyebrow="Features" title="Everything you need, beautifully unified" />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.06}}
              className="glass group relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.iconBg}`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <ul className="mt-4 space-y-1.5">
                {f.items.map((it)=>(
                  <li key={it} className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary" />{it}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <SectionHeading eyebrow="How It Works" title="From review to reel in 6 effortless steps" />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div key={s.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}
              className="relative">
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-sm font-bold text-primary-foreground">{i+1}</div>
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="mt-4 font-display font-semibold">{s.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Dashboard Preview */}
      <Section>
        <SectionHeading eyebrow="Dashboard" title="Your command center for AI-powered growth" />
        <DashboardMock />
      </Section>

      {/* AI Video Showcase */}
      <Section>
        <SectionHeading eyebrow="AI Video Studio" title="Turn a single review into a branded reel" />
        <div className="mt-12 grid items-center gap-6 lg:grid-cols-4">
          {[
            { icon: MessageSquare, label: "Customer Review", color: "from-pink-200 to-pink-100" },
            { icon: FileText, label: "AI Script", color: "from-blue-200 to-blue-100" },
            { icon: Users, label: "AI Avatar", color: "from-violet-200 to-violet-100" },
            { icon: Video, label: "Generated Reel", color: "from-emerald-200 to-emerald-100" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="glass relative aspect-[9/14] overflow-hidden rounded-3xl p-5">
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-50`} />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 backdrop-blur">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium">Step {i+1}</span>
                </div>
                <div className="mt-auto">
                  <p className="font-display font-semibold">{s.label}</p>
                  {i === 3 && (
                    <div className="mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]">
                      <Play className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Analytics */}
      <Section>
        <SectionHeading eyebrow="Analytics" title="Real outcomes, beautifully visualized" />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Reviews", value: 12400, icon: Star },
            { label: "Reach", value: 850000, icon: Eye, suffix: "+" },
            { label: "Likes", value: 42300, icon: Heart },
            { label: "Comments", value: 8200, icon: MessageSquare },
            { label: "Shares", value: 5600, icon: Share2 },
            { label: "Conversion", value: 18, icon: TrendingUp, suffix: "%" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}
              className="glass rounded-2xl p-5">
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-2xl font-bold"><Counter to={s.value} suffix={s.suffix || ""} /></p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <SectionHeading eyebrow="Testimonials" title="Loved by founders and marketers" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t,i)=>(
            <motion.div key={t.name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className="glass rounded-3xl p-6">
              <div className="flex gap-1 text-accent-pink-strong">{[...Array(5)].map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[image:var(--gradient-primary)]" />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-[2rem] bg-[image:var(--gradient-primary)] p-10 text-center text-primary-foreground shadow-[var(--shadow-elegant)] md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[color:var(--accent-pink)]/40 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold md:text-5xl">Ready to automate your marketing?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-foreground/80">Start your 14-day free trial. No credit card required.</p>
          <div className="relative mt-7 flex justify-center gap-3">
            <Button size="lg" className="rounded-2xl bg-white px-6 text-primary hover:bg-white/90">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="rounded-2xl border-white/30 bg-white/10 px-6 text-primary-foreground hover:bg-white/20">Book a Demo</Button>
          </div>
        </div>
      </Section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mx-auto max-w-2xl text-center">
      <div className="glass inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-primary">{eyebrow}</div>
      <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
}

function HeroVisual() {
  return (
    <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{duration:0.8,delay:0.1}} className="relative">
      <div className="glass relative rounded-[2rem] p-5 shadow-[var(--shadow-elegant)]">
        {/* Mini dashboard */}
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-3 h-5 flex-1 rounded-full bg-secondary" />
        </div>
        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl bg-secondary/70 p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-accent-pink-strong text-accent-pink-strong" />
              <span className="text-xs font-semibold">New 5-star review</span>
              <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Positive</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">"Best coffee in town — staff is incredible and the ambience is perfect."</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-[image:var(--gradient-soft)] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold"><Wand2 className="h-4 w-4 text-primary" /> AI Caption</div>
            <p className="mt-2 text-xs text-foreground/80">☕ When the coffee speaks for itself. Thank you, Priya! #CustomerLove #BrewedRight</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-secondary/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold"><Share2 className="h-4 w-4 text-primary" /> Publishing</div>
            <div className="flex gap-1.5">
              {[Instagram, Facebook, Linkedin, Youtube, Twitter].map((Icon, i)=>(
                <div key={i} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm"><Icon className="h-3.5 w-3.5 text-primary" /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Floating chips */}
      <motion.div animate={{y:[0,-10,0]}} transition={{duration:4,repeat:Infinity}} className="glass absolute -left-4 top-10 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold shadow-[var(--shadow-elegant)]">
        <Instagram className="h-4 w-4 text-accent-pink-strong" /> +1.2k reach
      </motion.div>
      <motion.div animate={{y:[0,12,0]}} transition={{duration:5,repeat:Infinity}} className="glass absolute -right-3 top-1/3 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold shadow-[var(--shadow-elegant)]">
        <Sparkles className="h-4 w-4 text-primary" /> AI generated
      </motion.div>
      <motion.div animate={{y:[0,-14,0]}} transition={{duration:6,repeat:Infinity}} className="glass absolute -bottom-2 left-12 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold shadow-[var(--shadow-elegant)]">
        <ThumbsUp className="h-4 w-4 text-primary" /> 98% positive
      </motion.div>
    </motion.div>
  );
}

function DashboardMock() {
  const sidebar = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Star, label: "Reviews" },
    { icon: Sparkles, label: "AI Content" },
    { icon: Video, label: "Videos" },
    { icon: Share2, label: "Publishing" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Settings, label: "Settings" },
  ];
  const widgets = [
    { label: "Total Reviews", value: "12,438", trend: "+12.4%", icon: Star },
    { label: "Published Posts", value: "3,210", trend: "+8.1%", icon: Share2 },
    { label: "Videos", value: "584", trend: "+22%", icon: Video },
    { label: "Engagement", value: "94.2%", trend: "+3.6%", icon: Heart },
  ];
  return (
    <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-12">
      <div className="glass overflow-hidden rounded-[2rem] p-3 shadow-[var(--shadow-elegant)]">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <div className="hidden rounded-2xl bg-secondary/60 p-4 lg:block">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
              <span className="font-display text-sm font-semibold">ReevoAI</span>
            </div>
            <nav className="mt-6 space-y-1">
              {sidebar.map((s)=>(
                <div key={s.label} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${s.active ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>
                  <s.icon className="h-4 w-4" /> {s.label}
                </div>
              ))}
            </nav>
          </div>
          {/* Main */}
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Welcome back</p>
                <h3 className="font-display text-xl font-bold">Hi, Aarav 👋</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="glass flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs"><Search className="h-3.5 w-3.5" />Search</div>
                <div className="glass flex h-9 w-9 items-center justify-center rounded-xl"><Bell className="h-4 w-4" /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {widgets.map((w)=>(
                <div key={w.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between"><w.icon className="h-4 w-4 text-primary" /><span className="text-[10px] font-semibold text-emerald-600">{w.trend}</span></div>
                  <p className="mt-3 font-display text-xl font-bold">{w.value}</p>
                  <p className="text-[11px] text-muted-foreground">{w.label}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Review Growth</p>
                  <span className="text-xs text-muted-foreground">Last 30 days</span>
                </div>
                <FakeChart />
              </div>
              <div className="glass rounded-2xl p-5">
                <p className="text-sm font-semibold">Platform Performance</p>
                <div className="mt-4 space-y-3">
                  {[
                    { name: "Instagram", value: 86, icon: Instagram },
                    { name: "Facebook", value: 64, icon: Facebook },
                    { name: "LinkedIn", value: 48, icon: Linkedin },
                    { name: "YouTube", value: 72, icon: Youtube },
                  ].map((p)=>(
                    <div key={p.name}>
                      <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><p.icon className="h-3.5 w-3.5 text-primary" />{p.name}</span><span className="font-semibold">{p.value}%</span></div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{width:`${p.value}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FakeChart() {
  const pts = [12,22,18,30,26,38,32,45,40,52,48,62,58,70,65,78];
  const max = 80;
  const path = pts.map((v,i)=>{
    const x = (i/(pts.length-1))*100;
    const y = 100 - (v/max)*100;
    return `${i===0?"M":"L"}${x},${y}`;
  }).join(" ");
  return (
    <div className="mt-4 h-40 w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.58 0.22 256)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.58 0.22 256)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L100,100 L0,100 Z`} fill="url(#g)" />
        <path d={path} fill="none" stroke="oklch(0.58 0.22 256)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

const features = [
  { title: "Review Collection", desc: "Capture rich reviews in every format.", icon: Star, iconBg: "bg-[image:var(--gradient-primary)]", items: ["Ratings & text","Photos & videos","Voice notes"] },
  { title: "AI Review Analysis", desc: "Auto-detect sentiment and themes.", icon: Brain, iconBg: "bg-[image:var(--gradient-primary)]", items: ["Sentiment scoring","Keyword extraction","Highlight detection"] },
  { title: "Content Generator", desc: "Captions for every channel, on brand.", icon: Wand2, iconBg: "bg-[image:var(--gradient-primary)]", items: ["Instagram & Facebook","LinkedIn & X","Success stories"] },
  { title: "AI Testimonial Videos", desc: "Studio-quality reels in minutes.", icon: Video, iconBg: "bg-[image:var(--gradient-primary)]", items: ["AI avatars","Voice narration","Subtitles & branding"] },
  { title: "Approval Workflow", desc: "Stay in control with one tap.", icon: CheckCircle2, iconBg: "bg-[image:var(--gradient-primary)]", items: ["Approve","Edit","Reject"] },
  { title: "Social Publishing", desc: "One click, everywhere.", icon: Share2, iconBg: "bg-[image:var(--gradient-primary)]", items: ["Instagram, Facebook","LinkedIn, YouTube, X","Schedule & queue"] },
];

const steps = [
  { title: "Customer submits review", desc: "Via QR, link or widget.", icon: MessageSquare },
  { title: "AI analyzes feedback", desc: "Sentiment, themes, highlights.", icon: Brain },
  { title: "AI generates content", desc: "Captions tailored per platform.", icon: Wand2 },
  { title: "AI creates testimonial video", desc: "Avatar, voice, subtitles.", icon: Video },
  { title: "Admin approves", desc: "Edit or approve with one tap.", icon: CheckCircle2 },
  { title: "Auto-published everywhere", desc: "Across all your channels.", icon: Zap },
];

const testimonials = [
  { name: "Priya Shah", role: "Owner, Brew Lab Café", quote: "We went from 0 social posts a week to 14, all from real customer voices. Game changer." },
  { name: "Dr. Rohan Mehta", role: "Smile Dental Clinic", quote: "Patient testimonials now turn into beautiful reels automatically. Bookings are up 38%." },
  { name: "Aisha Khan", role: "FitForge Gym", quote: "The AI captions sound exactly like our brand. Our trainers love how easy it is." },
];