"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

export interface Photo {
    id: string;
    url: string;
    title?: string;
}

interface PhotoGridProps {
    photos: Photo[];
    enableLikes?: boolean;
    onLike?: (photoId: string) => void;
    likedPhotos?: Set<string>;
}

// Stable deterministic height from ID
const getStableHeight = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    // 3 sizes: portrait (130%), square (100%), landscape (70%)
    const sizes = [130, 110, 90, 75];
    return sizes[Math.abs(hash) % sizes.length];
};

export default function PhotoGrid({ photos, enableLikes, onLike, likedPhotos }: PhotoGridProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = (i: number) => setLightboxIndex(i);
    const closeLightbox = () => setLightboxIndex(null);

    const goNext = useCallback(() => {
        setLightboxIndex(prev => prev === null ? null : (prev + 1) % photos.length);
    }, [photos.length]);

    const goPrev = useCallback(() => {
        setLightboxIndex(prev => prev === null ? null : (prev - 1 + photos.length) % photos.length);
    }, [photos.length]);

    useEffect(() => {
        if (lightboxIndex === null) {
            document.body.style.overflow = "";
            return;
        }
        document.body.style.overflow = "hidden";
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") goNext();
            else if (e.key === "ArrowLeft") goPrev();
            else if (e.key === "Escape") closeLightbox();
        };
        window.addEventListener("keydown", handleKey);
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [lightboxIndex, goNext, goPrev]);

    if (photos.length === 0) {
        return (
            <div className="py-20 text-center">
                <p className="text-4xl mb-3">🖼️</p>
                <p className="text-muted-foreground">No photos in this collection yet.</p>
            </div>
        );
    }

    const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

    return (
        <>
            {/* ── Beautiful Masonry Grid ── */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
                {photos.map((photo, i) => {
                    const h = getStableHeight(photo.id);
                    return (
                        <div
                            key={photo.id}
                            className="relative group break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-muted cursor-zoom-in shadow-md hover:shadow-2xl transition-all duration-500"
                            style={{ animationDelay: `${(i % 8) * 0.06}s` }}
                            onClick={() => openLightbox(i)}
                        >
                            <div className="relative w-full" style={{ paddingBottom: `${h}%` }}>
                                <img
                                    src={photo.url}
                                    alt={photo.title || "Gallery photo"}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                    loading="lazy"
                                />
                            </div>

                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-4">
                                {photo.title && (
                                    <p className="text-white text-sm font-medium leading-snug drop-shadow translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                        {photo.title}
                                    </p>
                                )}
                                <p className="text-white/60 text-xs mt-1 translate-y-1 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                    Click to view full size
                                </p>
                            </div>

                            {/* Like button */}
                            {enableLikes && onLike && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onLike(photo.id); }}
                                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${likedPhotos?.has(photo.id)
                                        ? "bg-rose-500 border-rose-500 text-white scale-110 shadow-lg shadow-rose-500/40"
                                        : "bg-black/30 border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black/50 hover:scale-110"
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos?.has(photo.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Full-Screen Lightbox ── */}
            {currentPhoto && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.97)" }}
                    onClick={closeLightbox}
                >
                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
                        <div className="pointer-events-auto">
                            {currentPhoto.title && (
                                <p className="text-white font-medium text-sm">{currentPhoto.title}</p>
                            )}
                            <p className="text-white/40 text-xs mt-0.5">
                                {(lightboxIndex ?? 0) + 1} of {photos.length}
                            </p>
                        </div>
                        <button
                            className="pointer-events-auto text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
                            onClick={closeLightbox}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Prev button */}
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Image — full viewport */}
                    <div
                        className="relative flex items-center justify-center w-full h-full px-20 py-16"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            key={currentPhoto.id}
                            src={currentPhoto.url}
                            alt={currentPhoto.title || "Gallery photo"}
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
                            style={{ animation: "lbFadeIn 0.22s cubic-bezier(0.22,1,0.36,1)" }}
                            draggable={false}
                        />
                    </div>

                    {/* Next button */}
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Bottom bar */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                        {/* Thumbnail strip */}
                        <div className="flex gap-2 overflow-x-auto max-w-[60vw] scrollbar-none">
                            {photos.map((p, idx) => (
                                <button
                                    key={p.id}
                                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                                    className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === lightboxIndex ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-80"
                                        }`}
                                >
                                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Like in lightbox */}
                        {enableLikes && onLike && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onLike(currentPhoto.id); }}
                                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-200 ${likedPhotos?.has(currentPhoto.id)
                                    ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/40"
                                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos?.has(currentPhoto.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span className="text-sm font-medium">
                                    {likedPhotos?.has(currentPhoto.id) ? "Favorited" : "Favorite"}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes lbFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .scrollbar-none { scrollbar-width: none; }
                .scrollbar-none::-webkit-scrollbar { display: none; }
            `}</style>
        </>
    );
}
