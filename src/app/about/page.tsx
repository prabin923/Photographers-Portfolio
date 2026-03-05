"use client";

import React from "react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="flex flex-col w-full min-h-screen bg-premium-gradient text-white font-sans overflow-x-hidden pt-20">
            {/* Hero Section */}
            <section className="relative w-full py-24 mb-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full z-0 h-[400px]"></div>

                <div className="container mx-auto px-10 relative z-10 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8 mx-auto shadow-xl slide-up">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                        Our Vision
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-gradient slide-up" style={{ animationDelay: "0.1s" }}>
                        The Soul Behind <br />
                        <span className="opacity-40 italic font-medium">The Lens</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/40 font-medium leading-relaxed slide-up" style={{ animationDelay: "0.2s" }}>
                        LensDrive isn't just a platform; it's a sanctuary for visual storytellers. Founded on the belief that every frame holds a universe, we've engineered the ultimate orchestration tool for the modern visionary.
                    </p>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-20 bg-black/20">
                <div className="container mx-auto px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 slide-up">
                            <h2 className="text-4xl font-black tracking-tight">The Philosophy</h2>
                            <p className="text-white/40 text-lg leading-relaxed">
                                We believe technology should fade into the background, leaving only the art and the experience. Our ecosystem is designed to amplify the emotional resonance of your work while providing the precision of a professional studio.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Authenticity", desc: "No filters, no compromises. Just the raw emotion captured in its purest form." },
                                    { title: "Precision", desc: "Every micro-interaction is tuned for high-performance delivery." },
                                    { title: "Symmetry", desc: "A perfect balance between artistic freedom and structured management." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 font-black border border-white/5 group-hover:bg-blue-500/10 transition-all">
                                            0{i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                                            <p className="text-white/20 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative aspect-square lg:aspect-auto h-[600px] slide-up" style={{ animationDelay: "0.3s" }}>
                            <div className="absolute inset-0 bg-blue-500/10 rounded-[3rem] blur-3xl opacity-20"></div>
                            <div className="w-full h-full glass-dark rounded-[3rem] border border-white/5 overflow-hidden p-3 relative z-10">
                                <div className="w-full h-full border border-white/10 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center text-8xl grayscale opacity-20">
                                    📸
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievement Section */}
            <section className="py-32">
                <div className="container mx-auto px-10 text-center">
                    <h2 className="text-3xl font-black mb-16 tracking-tight fade-in">Global Recognition</h2>
                    <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        {["MASTERCLASS 2024", "VOGUE ART", "VISUAL EXCELLENCE", "PURE PHOTOGRAPHY", "MODERN VISION"].map((brand, i) => (
                            <span key={i} className="text-sm font-black tracking-[0.4em] uppercase">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 bg-white/5 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-10 text-center slide-up">
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter">Join the movement.</h2>
                    <p className="text-lg text-white/30 mb-12 font-medium leading-relaxed">
                        Become part of the most exclusive community of photographers who are setting the new gold standard for client delivery.
                    </p>
                    <button className="px-12 py-6 rounded-3xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-105 transition-all accent-glow">
                        Connect With Us
                    </button>
                </div>
            </section>
        </div>
    );
}
