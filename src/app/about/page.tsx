import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="flex flex-col w-full min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">

            {/* ─── HERO ─── */}
            <section className="relative pt-32 pb-24 px-8 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-blue-600/6 blur-[150px] rounded-full pointer-events-none"></div>
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/8 text-[11px] font-semibold text-white/40 mb-8 tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Our story
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.92] mb-8">
                        Built for photographers<br />
                        <span className="text-white/20 italic font-light">who mean business.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/35 font-medium leading-relaxed max-w-2xl mx-auto">
                        LensFolio is a platform that gives photographers everything they need — a portfolio website, a cloud gallery for clients, and a professional delivery experience — all in one place.
                    </p>
                </div>
            </section>

            {/* ─── MISSION ─── */}
            <section className="py-24 px-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6">Our mission</p>
                        <h2 className="text-4xl font-black tracking-tight mb-6 leading-tight">
                            Photography deserves better tools.
                        </h2>
                        <p className="text-white/35 leading-relaxed mb-6">
                            We started LensFolio because we were tired of photographers juggling five different apps just to deliver work to a single client. A website builder here, a cloud drive there, an email client over there — it was fragmented and frustrating.
                        </p>
                        <p className="text-white/35 leading-relaxed">
                            So we built one unified platform. Simple enough to set up in an afternoon. Powerful enough to run your entire business.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { value: "100+", label: "Photographers" },
                            { value: "5K+", label: "Galleries delivered" },
                            { value: "120 GB", label: "Storage per user" },
                            { value: "2026", label: "Founded" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                                <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-white/25">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── VALUES ─── */}
            <section className="py-24 px-8 border-t border-white/5 bg-white/[0.01]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">What we believe</p>
                        <h2 className="text-4xl font-black tracking-tight">The principles we build on</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
                        {[
                            {
                                icon: "◈",
                                title: "Simplicity first",
                                desc: "Every feature we build has to earn its place. If it doesn't make photographers' lives easier, it doesn't ship.",
                            },
                            {
                                icon: "✦",
                                title: "Design matters",
                                desc: "Photographers have an eye for beauty. We hold our product to the same standard — every pixel should feel intentional.",
                            },
                            {
                                icon: "◉",
                                title: "Privacy by default",
                                desc: "Client galleries are private by nature. We treat your work and your clients' data with the seriousness they deserve.",
                            },
                        ].map((v, i) => (
                            <div key={i} className="bg-[#0a0a0a] p-10 hover:bg-white/[0.02] transition-colors group">
                                <div className="text-2xl text-white/20 mb-6 group-hover:text-white/50 transition-colors">{v.icon}</div>
                                <h3 className="text-lg font-black mb-3 group-hover:text-blue-400 transition-colors">{v.title}</h3>
                                <p className="text-sm text-white/30 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TEAM ─── */}
            <section className="py-24 px-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">The team</p>
                        <h2 className="text-4xl font-black tracking-tight">Made by a small, focused team</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            { name: "Prabin Sharma", role: "Founder & Developer", initials: "PS" },
                            { name: "Design Lead", role: "UI & Experience", initials: "DL" },
                            { name: "You?", role: "We're building this together", initials: "?" },
                        ].map((member, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-all group">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-lg font-black text-white/30 mx-auto mb-4 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
                                    {member.initials}
                                </div>
                                <p className="font-black text-sm">{member.name}</p>
                                <p className="text-xs text-white/25 mt-1">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="py-32 px-8 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[50vw] h-[50vw] bg-blue-600/4 rounded-full blur-[140px]"></div>
                </div>
                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                        Ready to simplify<br />
                        <span className="text-white/20 italic font-light">your workflow?</span>
                    </h2>
                    <p className="text-white/30 text-lg font-medium mb-10 leading-relaxed">
                        Join LensFolio and spend less time managing tools — and more time behind the lens.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/login"
                            className="px-8 py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-white/90 hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.08)]">
                            Get started free
                        </Link>
                        <Link href="/signup"
                            className="px-8 py-4 rounded-2xl border border-white/10 text-sm font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all">
                            Create account →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
