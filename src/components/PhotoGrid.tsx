"use client";

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

const getStableHeight = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const sizes = [120, 100, 135, 85, 150, 70];
    return sizes[Math.abs(hash) % sizes.length];
};

const cleanUrl = (url: string) => url ? url.replace("http://localhost:4000", "") : "";

export default function PhotoGrid({ photos, enableLikes, onLike, likedPhotos }: PhotoGridProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [imgLoaded, setImgLoaded] = useState(false);

    const openLightbox = (i: number) => { setLightboxIndex(i); setImgLoaded(false); };
    const closeLightbox = () => setLightboxIndex(null);

    const goNext = useCallback(() => {
        setImgLoaded(false);
        setLightboxIndex(prev => prev === null ? null : (prev + 1) % photos.length);
    }, [photos.length]);

    const goPrev = useCallback(() => {
        setImgLoaded(false);
        setLightboxIndex(prev => prev === null ? null : (prev - 1 + photos.length) % photos.length);
    }, [photos.length]);

    useEffect(() => {
        if (lightboxIndex === null) { document.body.style.overflow = ""; return; }
        document.body.style.overflow = "hidden";
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") goNext();
            else if (e.key === "ArrowLeft") goPrev();
            else if (e.key === "Escape") closeLightbox();
        };
        window.addEventListener("keydown", handler);
        return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
    }, [lightboxIndex, goNext, goPrev]);

    const downloadPhoto = async (url: string, id: string) => {
        try {
            const res = await fetch(cleanUrl(url));
            const blob = await res.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `photo-${id}.jpg`;
            link.click();
        } catch (e) {
            window.open(cleanUrl(url), "_blank");
        }
    };

    if (photos.length === 0) return (
        <div className="py-40 flex flex-col items-center gap-6 text-center animate-fade-in">
            <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-5xl opacity-40">🖼</div>
            <div>
                <p className="text-white/40 font-black text-lg uppercase tracking-widest">No Photos Found</p>
                <p className="text-white/10 text-sm mt-1">This collection is currently empty.</p>
            </div>
        </div>
    );

    const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

    return (
        <>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-6 [column-fill:_balance]">
                {photos.map((photo, i) => {
                    const h = getStableHeight(photo.id);
                    return (
                        <div key={photo.id}
                            className="relative group break-inside-avoid mb-6 rounded-3xl overflow-hidden cursor-zoom-in bg-white/[0.02] border border-white/5 transition-all duration-700 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1.5"
                            onClick={() => openLightbox(i)}>
                            <div className="relative w-full overflow-hidden" style={{ paddingBottom: `${h}%` }}>
                                <img src={cleanUrl(photo.url)} alt=""
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.08]"
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.classList.add('bg-white/5'); }} />
                                
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 scale-90 group-hover:scale-100 transition-all duration-700 shadow-2xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-6 pb-5">
                                {photo.title && <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] translate-y-2 group-hover:translate-y-0 transition-transform duration-700">{photo.title}</p>}
                                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1 translate-y-3 group-hover:translate-y-0 transition-transform duration-700 delay-75">View Project</p>
                            </div>

                            {enableLikes && onLike && (
                                <button onClick={(e) => { e.stopPropagation(); onLike(photo.id); }}
                                    className={`absolute top-5 right-5 p-3 rounded-full backdrop-blur-3xl border transition-all duration-500 ${likedPhotos?.has(photo.id) ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-115" : "bg-black/30 border-white/10 text-white opacity-0 group-hover:opacity-100 hover:scale-110"}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos?.has(photo.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <LightboxPanel currentPhoto={currentPhoto} lightboxIndex={lightboxIndex} photos={photos}
                imgLoaded={imgLoaded} setImgLoaded={setImgLoaded} closeLightbox={closeLightbox}
                goNext={goNext} goPrev={goPrev} enableLikes={enableLikes} onLike={onLike}
                likedPhotos={likedPhotos} setLightboxIndex={setLightboxIndex} downloadPhoto={downloadPhoto} />

            <style>{`
                .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </>
    );
}

function LightboxPanel({ currentPhoto, lightboxIndex, photos, imgLoaded, setImgLoaded, closeLightbox, goNext, goPrev, enableLikes, onLike, likedPhotos, setLightboxIndex, downloadPhoto }: any) {
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);

    useEffect(() => {
        if (currentPhoto) {
            requestAnimationFrame(() => setVisible(true));
        }
    }, [currentPhoto]);

    useEffect(() => {
        if (!currentPhoto) return;
        const timer = setTimeout(() => setControlsVisible(false), 3000);
        return () => clearTimeout(timer);
    }, [currentPhoto, lightboxIndex]);

    const handleMouseMove = () => {
        setControlsVisible(true);
    };

    const handleNext = () => goNext();
    const handlePrev = () => goPrev();

    const handleClose = () => {
        setVisible(false);
        setTimeout(closeLightbox, 300);
    };

    const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) handleNext();
            else handlePrev();
        }
        setTouchStartX(null);
    };

    if (!currentPhoto) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col overflow-hidden"
            style={{
                background: visible ? "rgba(4,4,4,0.99)" : "rgba(0,0,0,0)",
                backdropFilter: visible ? "blur(40px)" : "blur(0px)",
                transition: "background 0.5s cubic-bezier(0.4,0,0.2,1), backdrop-filter 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
            onClick={handleClose}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}>

            {/* Top bar controls */}
            <div className={`absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-8 z-50 transition-all duration-700 ${controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`}>
                <div className="pointer-events-none">
                    <p className="text-white text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-2xl">{(lightboxIndex ?? 0) + 1} / {photos.length}</p>
                    {currentPhoto.title && <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1.5">{currentPhoto.title}</p>}
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); downloadPhoto(currentPhoto.url, currentPhoto.id); }}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all backdrop-blur-3xl border border-white/5 hover:scale-110 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all backdrop-blur-3xl border border-white/5 hover:rotate-90 hover:scale-110 active:scale-95" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Navigation buttons */}
            {photos.length > 1 && (
                <>
                    <button className={`absolute left-8 top-1/2 -translate-y-1/2 z-50 w-20 h-20 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/20 hover:text-white transition-all duration-500 hover:scale-110 active:scale-90 backdrop-blur-3xl border border-white/5 ${controlsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`} onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button className={`absolute right-8 top-1/2 -translate-y-1/2 z-50 w-20 h-20 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/20 hover:text-white transition-all duration-500 hover:scale-110 active:scale-90 backdrop-blur-3xl border border-white/5 ${controlsVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`} onClick={(e) => { e.stopPropagation(); handleNext(); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </>
            )}

            {/* Main image */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-24 relative select-none" onClick={(e) => e.stopPropagation()}>
                {!imgLoaded && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-14 h-14 border-2 border-white/5 border-t-white/40 rounded-full animate-spin"></div>
                    </div>
                )}
                <img key={currentPhoto.id} src={cleanUrl(currentPhoto.url)} alt=""
                    onLoad={() => setImgLoaded(true)}
                    className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.9)] z-10 transition-all duration-700 ease-in-out"
                    style={{
                        opacity: imgLoaded ? 1 : 0,
                        transform: imgLoaded ? "scale(1)" : "scale(0.96)",
                    }}
                    draggable={false} />
            </div>

            {/* Bottom bar */}
            <div className={`absolute bottom-0 left-0 right-0 flex flex-col gap-8 p-10 pb-16 transition-all duration-1000 ${controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
                <div className="flex items-center justify-between px-4">
                    {enableLikes && onLike && (
                        <button onClick={(e) => { e.stopPropagation(); onLike(currentPhoto.id); }}
                            className={`flex items-center gap-4 px-10 py-5 rounded-[2.5rem] backdrop-blur-3xl border transition-all duration-700 hover:scale-105 active:scale-95 ${likedPhotos?.has(currentPhoto.id) ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_50px_rgba(244,63,94,0.5)]" : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos?.has(currentPhoto.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="text-[12px] font-black uppercase tracking-[0.3em]">{likedPhotos?.has(currentPhoto.id) ? "Favorited" : "Add to Favorites"}</span>
                        </button>
                    )}
                    
                    <button onClick={(e) => { e.stopPropagation(); downloadPhoto(currentPhoto.url, currentPhoto.id); }}
                        className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-emerald-400 transition-all duration-500 pb-1.5 border-b border-transparent hover:border-emerald-500/30">
                        Download Original
                    </button>
                </div>

                {photos.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto justify-center pb-4 scrollbar-hide no-scrollbar" style={{ scrollbarWidth: "none" }}>
                        {photos.map((p: any, idx: number) => (
                            <button key={p.id} onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); setImgLoaded(false); }}
                                className={`shrink-0 w-16 h-16 rounded-[1.25rem] overflow-hidden border-2 transition-all duration-700 ${idx === lightboxIndex ? "border-white scale-125 shadow-2xl z-10" : "border-transparent opacity-15 hover:opacity-100 hover:scale-110"}`}>
                                <img src={cleanUrl(p.url)} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
