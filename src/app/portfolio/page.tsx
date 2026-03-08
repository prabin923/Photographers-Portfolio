"use client";

import { useEffect, useState } from "react";
import PhotoGrid, { Photo } from "@/components/PhotoGrid";

const FALLBACK_PHOTOS: Photo[] = [
    { id: "p1", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2669&auto=format&fit=crop", title: "Wedding Moments" },
    { id: "p2", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2670&auto=format&fit=crop", title: "Fashion Editorial" },
    { id: "p3", url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2670&auto=format&fit=crop", title: "Love & Light" },
    { id: "p4", url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=2674&auto=format&fit=crop", title: "Portraits" },
    { id: "p5", url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2671&auto=format&fit=crop", title: "Urban Exploration" },
    { id: "p6", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2670&auto=format&fit=crop", title: "Nature's Serenity" },
];

export default function PortfolioPage() {
    const [photos, setPhotos] = useState<Photo[]>(FALLBACK_PHOTOS);
    const [tagline, setTagline] = useState("A selection of our latest and most cherished captures.");
    const [name, setName] = useState("Featured Portfolio");
    const [theme, setTheme] = useState("dark");
    const [accentColor, setAccentColor] = useState("#3b82f6");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:4000/api/site")
            .then(res => res.json())
            .then(data => {
                if (data.portfolioPhotos?.length > 0) setPhotos(data.portfolioPhotos);
                if (data.tagline) setTagline(data.tagline);
                if (data.photographerName) setName(data.photographerName);
                if (data.theme) setTheme(data.theme);
                if (data.accentColor) setAccentColor(data.accentColor);
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className={`min-h-screen theme-${theme} text-white font-sans overflow-y-auto custom-scrollbar flex flex-col p-10`}
            style={{ "--accent": accentColor } as React.CSSProperties}>
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-20 slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] mb-6 mx-auto shadow-xl"
                        style={{ color: accentColor }}>
                        <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: accentColor }}></span>
                        Curated Collection
                    </div>
                    <h1 className="text-6xl font-black mb-6 tracking-tighter text-gradient">{name || "Featured Portfolio"}</h1>
                    <p className="text-white/30 max-w-xl mx-auto text-sm font-medium leading-relaxed tracking-wide">{tagline}</p>
                </div>

                <div className="glass-dark border border-white/5 rounded-[3rem] p-8 md:p-12 mb-20">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <PhotoGrid photos={photos} />
                    )}
                </div>
            </div>
        </div>
    );
}
