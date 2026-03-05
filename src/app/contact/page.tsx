"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");
        setTimeout(() => setFormStatus("success"), 1500);
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-premium-gradient text-white font-sans overflow-x-hidden pt-20 pb-40">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-blue-600/5 blur-[120px] rounded-full z-0 pointer-events-none animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-[50vw] h-[50vw] bg-purple-600/5 blur-[150px] rounded-full z-0 pointer-events-none"></div>

            <div className="container mx-auto px-10 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-24 slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8 mx-auto shadow-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
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
                    {/* Contact Info */}
                    <div className="lg:col-span-4 space-y-12 slide-up" style={{ animationDelay: "0.1s" }}>
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Direct Access</h3>
                            <div className="space-y-6">
                                <a href="mailto:hello@lensdrive.art" className="block group">
                                    <p className="text-2xl font-black group-hover:text-blue-400 transition-colors">hello@lensdrive.art</p>
                                    <p className="text-sm text-white/20 uppercase tracking-widest mt-1">General Inquiries</p>
                                </a>
                                <div className="block group">
                                    <p className="text-2xl font-black">+977 1 234 5678</p>
                                    <p className="text-sm text-white/20 uppercase tracking-widest mt-1">Studio Direct</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Our Sanctuary</h3>
                            <p className="text-xl font-bold leading-relaxed">
                                Kathmandu, Nepal <br />
                                <span className="text-white/30 font-medium">Laldurbar, Durbar Marg</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Social Synchrony</h3>
                            <div className="flex gap-4">
                                {["IG", "TW", "PI", "LI"].map((social) => (
                                    <button key={social} className="w-12 h-12 rounded-2xl glass-dark border border-white/5 flex items-center justify-center font-black text-xs hover:bg-white hover:text-black transition-all">
                                        {social}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-8 slide-up" style={{ animationDelay: "0.2s" }}>
                        <div className="glass-dark border border-white/5 rounded-[3rem] p-12 relative overflow-hidden">
                            {formStatus === "success" ? (
                                <div className="text-center py-20 flex flex-col items-center justify-center gap-6 slide-up">
                                    <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-5xl">
                                        🕊️
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight">Message Harmonized</h3>
                                    <p className="text-white/40 font-medium max-w-sm">Thank you. Your inquiry has been sent to our studio. We orchestrate responses with priority.</p>
                                    <button onClick={() => setFormStatus("idle")} className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors mt-4">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Full Identity</label>
                                            <input required type="text" placeholder="Your Name" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Digital Address</label>
                                            <input required type="email" placeholder="email@address.com" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Purpose of Inquiry</label>
                                        <select className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm appearance-none">
                                            <option className="bg-zinc-950">Portrait Session</option>
                                            <option className="bg-zinc-950">Wedding Legacy</option>
                                            <option className="bg-zinc-950">Global Collaboration</option>
                                            <option className="bg-zinc-950">Other Inquiries</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Your Message</label>
                                        <textarea required rows={5} placeholder="How can we help you achieve your vision?" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm resize-none"></textarea>
                                    </div>
                                    <button disabled={formStatus === "submitting"} className={`w-full py-6 rounded-3xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all accent-glow flex items-center justify-center gap-3 ${formStatus === "submitting" ? "opacity-50" : ""}`}>
                                        {formStatus === "submitting" ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                Transmitting...
                                            </>
                                        ) : "Initialize Transmission"}
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
