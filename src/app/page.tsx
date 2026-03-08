"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const FEATURES = [
  { icon: "◈", title: "Smart Galleries", desc: "Deliver private, password-protected galleries to clients with a beautiful, cinematic viewing experience." },
  { icon: "☁", title: "Cloud Drive", desc: "Upload, store, and organize all your work in one place. Share entire projects in seconds with a single link." },
  { icon: "✦", title: "Website Builder", desc: "Create a stunning personal portfolio website in minutes. Choose themes, upload photos, and publish instantly." },
  { icon: "⊕", title: "Client Favorites", desc: "Let clients mark their favorite shots by clicking a heart — no account needed, no friction." },
  { icon: "◉", title: "Custom Themes", desc: "Choose from curated dark themes with customizable accent colors to match your personal brand perfectly." },
  { icon: "⊞", title: "Instant Delivery", desc: "Share unique gallery links that clients can access from any device, anywhere in the world." },
];

const SHOWCASE = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525786053596-654cbfe4e3c4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800&auto=format&fit=crop",
];

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 40 ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <span className="text-base font-black tracking-tight">LensFolio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/40">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-white/40 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/login"
              className="px-5 py-2 rounded-xl bg-white text-black text-sm font-black hover:bg-white/90 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-8 pt-16 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] bg-blue-600/8 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-600/6 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/8 text-[11px] font-semibold text-white/50 mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Website builder & cloud delivery for photographers
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[80px] font-black tracking-[-0.03em] leading-[0.92] mb-8">
            The smarter way to
            <br />
            <span className="text-white/20 italic font-light">run your photography</span>
            <br />
            <span className="text-white">business.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/35 font-medium leading-relaxed max-w-2xl mx-auto mb-12">
            Build a stunning portfolio website, deliver private galleries to clients, and manage your entire creative workflow — all from one elegant dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/login"
              className="px-8 py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-white/90 hover:scale-[1.02] transition-all w-full sm:w-auto shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Start for free
            </Link>
            <Link href="/portfolio"
              className="px-8 py-4 rounded-2xl border border-white/10 text-sm font-semibold text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all w-full sm:w-auto">
              See example portfolio →
            </Link>
          </div>
          <p className="text-xs text-white/20 font-medium">No credit card required &nbsp;·&nbsp; Free forever plan available</p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* ─── GALLERY MOSAIC SHOWCASE ─── */}
      <section id="gallery" className="py-24 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Work delivered with LensFolio</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Galleries your clients<br />
              <span className="text-white/25 italic font-light">will fall in love with</span>
            </h2>
          </div>
          {/* Scrolling strip */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10"></div>
            <div className="flex gap-4 overflow-hidden">
              <div className="flex gap-4 animate-[marquee_30s_linear_infinite]" style={{ minWidth: "max-content" }}>
                {[...SHOWCASE, ...SHOWCASE].map((url, i) => (
                  <div key={i} className="flex-shrink-0 w-64 h-44 rounded-2xl overflow-hidden border border-white/5">
                    <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Built for photographers,<br />
              <span className="text-white/25 italic font-light">by photographers.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
            {FEATURES.map((feat, i) => (
              <div key={i} className="bg-[#0a0a0a] p-8 hover:bg-white/[0.02] transition-colors group">
                <div className="text-2xl mb-5 text-white/30 group-hover:text-white/60 transition-colors">{feat.icon}</div>
                <h3 className="text-base font-black mb-2 group-hover:text-blue-400 transition-colors">{feat.title}</h3>
                <p className="text-sm text-white/30 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Simple workflow</p>
            <h2 className="text-4xl font-black tracking-tight">Up and running in minutes</h2>
          </div>
          <div className="space-y-0 divide-y divide-white/5">
            {[
              { step: "01", title: "Create your account", desc: "Sign up in seconds. No credit card. No onboarding calls. Just your email and a password." },
              { step: "02", title: "Build your website", desc: "Pick a theme, add your photos, write your bio, and hit Publish. Your personal site is live instantly." },
              { step: "03", title: "Create a gallery for your client", desc: "Upload their photos, generate a unique private link, and share it. They can browse, favorite, and download." },
              { step: "04", title: "Impress & grow", desc: "Clients share their experience, you get more leads, and LensFolio helps you stay focused on your craft." },
            ].map((s, i) => (
              <div key={i} className="flex gap-8 md:gap-16 items-start py-10 group">
                <div className="text-[48px] font-black text-white/5 group-hover:text-white/10 transition-colors leading-none flex-shrink-0 w-16">{s.step}</div>
                <div>
                  <h3 className="text-xl font-black mb-2 group-hover:text-blue-400 transition-colors">{s.title}</h3>
                  <p className="text-white/30 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 px-8 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Simple pricing</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">One plan. Everything included.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: ["1 portfolio website", "Up to 3 client galleries", "5 GB storage", "Basic themes"],
                cta: "Start free",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$12",
                period: "per month",
                badge: "Most popular",
                features: ["Unlimited portfolio site", "Unlimited galleries", "120 GB storage", "All premium themes", "Custom accent colors", "Priority support"],
                cta: "Start free trial",
                highlight: true,
              },
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-3xl p-8 text-left border transition-all hover:scale-[1.01] ${plan.highlight ? "bg-white text-black border-white shadow-[0_0_60px_rgba(255,255,255,0.08)]" : "bg-white/3 border-white/8 hover:border-white/15"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    {plan.badge}
                  </div>
                )}
                <p className={`text-sm font-black uppercase tracking-widest mb-2 ${plan.highlight ? "text-black/40" : "text-white/30"}`}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className={`text-sm font-medium ${plan.highlight ? "text-black/40" : "text-white/30"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm font-medium ${plan.highlight ? "text-black/70" : "text-white/40"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-black" : "text-blue-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login"
                  className={`block w-full py-3.5 rounded-2xl text-sm font-black text-center uppercase tracking-wider transition-all hover:opacity-90 ${plan.highlight ? "bg-black text-white" : "bg-white/5 text-white border border-white/10 hover:bg-white/10"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-40 px-8 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[150px]"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Create your ideal<br />
            <span className="text-white/20 italic font-light">photography website.</span>
          </h2>
          <p className="text-white/30 text-lg font-medium mb-12 leading-relaxed">
            Built for creative individuals and creative minds.<br />
            Start free, upgrade when you're ready.
          </p>
          <Link href="/login"
            className="inline-block px-12 py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-white/90 hover:scale-[1.02] transition-all shadow-[0_0_60px_rgba(255,255,255,0.08)]">
            Get started — it's free
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <span className="text-sm font-black">LensFolio</span>
            <span className="text-white/20 text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-medium text-white/25">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
