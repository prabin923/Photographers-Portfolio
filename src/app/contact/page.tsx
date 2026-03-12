"use client";

import React, { useEffect, useState } from "react";

interface SiteContactData {
    email: string;
    phone: string;
    location: string;
    instagramUrl: string;
    twitterUrl: string;
    pinterestUrl: string;
    photographerName: string;
    theme: string;
    accentColor: string;
}

const defaults: SiteContactData = {
    email: "",
    phone: "",
    location: "",
    instagramUrl: "#",
    twitterUrl: "#",
    pinterestUrl: "#",
    photographerName: "Studio",
    theme: "dark",
    accentColor: "#3b82f6",
};

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
    const [site, setSite] = useState<SiteContactData>(defaults);

    useEffect(() => {
        fetch("/api/site")
            .then(res => res.json())
            .then(data => setSite({ ...defaults, ...data }))
            .catch(() => { });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");
        setTimeout(() => setFormStatus("success"), 1500);
    };

    const socials = [
        { label: "IG", url: site.instagramUrl, color: "#e1306c" },
        { label: "TW", url: site.twitterUrl, color: "#1da1f2" },
        { label: "PI", url: site.pinterestUrl, color: "#e60023" },
    ];

    return (
        <div className={`flex flex-col w-full min-h-screen theme-${site.theme} text-white font-sans overflow-x-hidden pt-20 pb-40`}
            style={{ "--accent": site.accentColor } as React.CSSProperties}>
            <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full z-0 pointer-events-none blur-[100px] opacity-10"
                style={{ background: site.accentColor }}></div>

            <div className="container mx-auto px-10 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-24 slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] mb-8 mx-auto shadow-xl"
                        style={{ color: site.accentColor }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: site.accentColor }}></span>
                        Let's Connect
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-gradient leading-[0.9]">
                        Let's Create <br />
                        <span className="opacity-40 italic font-medium">Magic Together</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/30 max-w-2xl mx-auto font-medium leading-relaxed">
                        Ready to orchestrate your visual legacy? Reach out for collaborations, bookings, or simply to say hello.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-7xl mx-auto">
                    {/* Info */}
                    <div className="lg:col-span-4 space-y-10 slide-up" style={{ animationDelay: "0.1s" }}>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-5">Direct Access</p>
                            <div className="space-y-6">
                                {site.email && (
                                    <a href={`mailto:${site.email}`} className="block group">
                                        <p className="text-lg font-black transition-colors break-all" style={{ color: "inherit" }}
                                            onMouseEnter={e => (e.currentTarget.style.color = site.accentColor)}
                                            onMouseLeave={e => (e.currentTarget.style.color = "inherit")}>{site.email}</p>
                                        <p className="text-xs text-white/20 uppercase tracking-widest mt-1">General Inquiries</p>
                                    </a>
                                )}
                                {site.phone && (
                                    <div>
                                        <p className="text-lg font-black">{site.phone}</p>
                                        <p className="text-xs text-white/20 uppercase tracking-widest mt-1">Studio Direct</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {site.location && (
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Location</p>
                                <p className="text-lg font-bold">{site.location}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Follow Along</p>
                            <div className="flex gap-3">
                                {socials.map(({ label, url }) => (
                                    <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl glass-dark border border-white/5 flex items-center justify-center font-black text-xs hover:scale-110 transition-all"
                                        style={{}}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${site.accentColor}20`; (e.currentTarget as HTMLElement).style.borderColor = `${site.accentColor}40`; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.borderColor = ""; }}>
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-8 slide-up" style={{ animationDelay: "0.2s" }}>
                        <div className="glass-dark border border-white/5 rounded-[3rem] p-12 relative overflow-hidden">
                            {formStatus === "success" ? (
                                <div className="text-center py-20 flex flex-col items-center gap-6 slide-up">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
                                        style={{ background: `${site.accentColor}15`, border: `1px solid ${site.accentColor}30` }}>🕊️</div>
                                    <h3 className="text-3xl font-black tracking-tight">Message Sent!</h3>
                                    <p className="text-white/40 font-medium max-w-sm">Thank you. Your inquiry has been received by {site.photographerName}. We'll be in touch soon.</p>
                                    <button onClick={() => setFormStatus("idle")} className="text-xs font-black uppercase tracking-widest mt-4" style={{ color: site.accentColor }}>
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Full Name</label>
                                            <input required type="text" placeholder="Your Name" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none transition-all font-medium text-sm placeholder:text-white/15"
                                                onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 2px ${site.accentColor}40`)}
                                                onBlur={e => (e.currentTarget.style.boxShadow = "")} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Email Address</label>
                                            <input required type="email" placeholder="email@address.com" className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none transition-all font-medium text-sm placeholder:text-white/15"
                                                onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 2px ${site.accentColor}40`)}
                                                onBlur={e => (e.currentTarget.style.boxShadow = "")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Inquiry Type</label>
                                        <select className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none transition-all font-medium text-sm appearance-none">
                                            <option className="bg-zinc-950">Portrait Session</option>
                                            <option className="bg-zinc-950">Wedding Coverage</option>
                                            <option className="bg-zinc-950">Commercial Project</option>
                                            <option className="bg-zinc-950">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Message</label>
                                        <textarea required rows={5} placeholder="Tell us about your vision..." className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none transition-all font-medium text-sm resize-none placeholder:text-white/15"
                                            onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 2px ${site.accentColor}40`)}
                                            onBlur={e => (e.currentTarget.style.boxShadow = "")}></textarea>
                                    </div>
                                    <button disabled={formStatus === "submitting"}
                                        className="w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-white disabled:opacity-50"
                                        style={{ background: site.accentColor, boxShadow: `0 0 30px ${site.accentColor}40` }}>
                                        {formStatus === "submitting" ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : "Send Message"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
