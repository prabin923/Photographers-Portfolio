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
    const sizes = [120, 100, 85, 70];
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

    if (photos.length === 0) return (
        <div className="py-32 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-4xl opacity-30">🖼</div>
            <p className="text-white/20 text-sm font-medium">No photos uploaded yet. Drag & drop above to add some.</p>
        </div>
    );

    const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

    // 1-photo: full bleed hero
    if (photos.length === 1) return (
        <>
            <div className="relative w-full rounded-3xl overflow-hidden cursor-zoom-in group"
                style={{ maxHeight: "70vh" }}
                onClick={() => openLightbox(0)}>
                <img src={cleanUrl(photos[0].url)} alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 bg-white/5"
                    style={{ maxHeight: "70vh", color: "transparent" }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.classList.add('bg-white/5'); }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <div>
                        {photos[0].title && <p className="text-white font-bold text-lg">{photos[0].title}</p>}
                        <p className="text-white/50 text-sm mt-1">Click to view full size</p>
                    </div>
                </div>
                {enableLikes && onLike && (
                    <button onClick={(e) => { e.stopPropagation(); onLike(photos[0].id); }}
                        className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border transition-all duration-300 ${likedPhotos?.has(photos[0].id) ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-110" : "bg-black/30 border-white/10 text-white opacity-0 group-hover:opacity-100"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos?.has(photos[0].id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                )}
            </div>
            <LightboxPanel currentPhoto={currentPhoto} lightboxIndex={lightboxIndex} photos={photos}
                imgLoaded={imgLoaded} setImgLoaded={setImgLoaded} closeLightbox={closeLightbox}
                goNext={goNext} goPrev={goPrev} enableLikes={enableLikes} onLike={onLike}
                likedPhotos={likedPhotos} setLightboxIndex={setLightboxIndex} />
        </>
    );

    // 2-3 photos: side-by-side row
    if (photos.length <= 3) return (
        <>
            <div className={`grid gap-3 ${photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {photos.map((photo, i) => (
                    <div key={photo.id} className="relative rounded-2xl overflow-hidden cursor-zoom-in group"
                        style={{ aspectRatio: "3/4" }}
                        onClick={() => openLightbox(i)}>
                        <img src={cleanUrl(photo.url)} alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 bg-white/5"
                            style={{ color: "transparent" }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.classList.add('bg-white/5'); }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4">
                            {photo.title && <p className="text-white text-sm font-medium">{photo.title}</p>}
                        </div>
                        {enableLikes && onLike && (
                            <button onClick={(e) => { e.stopPropagation(); onLike(photo.id); }}
                                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${likedPhotos?.has(photo.id) ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)] scale-110" : "bg-black/30 border-white/10 text-white opacity-0 group-hover:opacity-100"}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos?.has(photo.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <LightboxPanel currentPhoto={currentPhoto} lightboxIndex={lightboxIndex} photos={photos}
                imgLoaded={imgLoaded} setImgLoaded={setImgLoaded} closeLightbox={closeLightbox}
                goNext={goNext} goPrev={goPrev} enableLikes={enableLikes} onLike={onLike}
                likedPhotos={likedPhotos} setLightboxIndex={setLightboxIndex} />
        </>
    );

    // 4+ photos: masonry
    return (
        <>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
                {photos.map((photo, i) => {
                    const h = getStableHeight(photo.id);
                    return (
                        <div key={photo.id}
                            className="relative group break-inside-avoid mb-3 rounded-2xl overflow-hidden cursor-zoom-in"
                            style={{ animationDelay: `${(i % 8) * 0.05}s` }}
                            onClick={() => openLightbox(i)}>
                            <div className="relative w-full" style={{ paddingBottom: `${h}%` }}>
                                <img src={cleanUrl(photo.url)} alt=""
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.classList.add('bg-white/5'); }} />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                                {photo.title && <p className="text-white text-xs font-semibold translate-y-1 group-hover:translate-y-0 transition-transform duration-300">{photo.title}</p>}
                            </div>
                            {enableLikes && onLike && (
                                <button onClick={(e) => { e.stopPropagation(); onLike(photo.id); }}
                                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${likedPhotos?.has(photo.id) ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)] scale-110" : "bg-black/30 border-white/10 text-white opacity-0 group-hover:opacity-100"}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos?.has(photo.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
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
                likedPhotos={likedPhotos} setLightboxIndex={setLightboxIndex} />
        </>
    );
}

function LightboxPanel({ currentPhoto, lightboxIndex, photos, imgLoaded, setImgLoaded, closeLightbox, goNext, goPrev, enableLikes, onLike, likedPhotos, setLightboxIndex }: any) {
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [slideDir, setSlideDir] = useState<"left" | "right" | "none">("none");

    // Fade-in on mount
    useEffect(() => {
        if (currentPhoto) {
            requestAnimationFrame(() => setVisible(true));
        }
    }, [currentPhoto]);

    // Auto-hide controls after 3s of inactivity
    useEffect(() => {
        if (!currentPhoto) return;
        const timer = setTimeout(() => setControlsVisible(false), 3000);
        return () => clearTimeout(timer);
    }, [currentPhoto, lightboxIndex]);

    const handleMouseMove = () => {
        setControlsVisible(true);
    };

    // Preload adjacent images
    useEffect(() => {
        if (lightboxIndex === null || photos.length <= 1) return;
        const nextIdx = (lightboxIndex + 1) % photos.length;
        const prevIdx = (lightboxIndex - 1 + photos.length) % photos.length;
        [nextIdx, prevIdx].forEach(idx => {
            const img = new Image();
            img.src = cleanUrl(photos[idx].url);
        });
    }, [lightboxIndex, photos]);

    const handleNext = () => { setSlideDir("left"); goNext(); };
    const handlePrev = () => { setSlideDir("right"); goPrev(); };

    const handleClose = () => {
        setVisible(false);
        setTimeout(closeLightbox, 250);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

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

    const progress = photos.length > 1 ? ((lightboxIndex ?? 0) + 1) / photos.length * 100 : 100;

    return (
        <div
            className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden"
            style={{
                background: visible ? "rgba(0,0,0,0.97)" : "rgba(0,0,0,0)",
                backdropFilter: visible ? "blur(20px)" : "blur(0px)",
                transition: "background 0.35s cubic-bezier(0.4,0,0.2,1), backdrop-filter 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}
            onClick={handleClose}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}>

            {/* Progress bar */}
            {photos.length > 1 && (
                <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-white/5">
                    <div className="h-full bg-white/40 transition-all duration-500 ease-out rounded-r-full" style={{ width: `${progress}%` }} />
                </div>
            )}

            {/* Top bar */}
            <div className={`fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/70 via-black/30 to-transparent z-50 pointer-events-none transition-all duration-500 ${controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
                <div className="pointer-events-auto">
                    {currentPhoto.title && <p className="text-white font-semibold text-sm drop-shadow-lg">{currentPhoto.title}</p>}
                    <p className="text-white/40 text-xs mt-0.5 font-medium tracking-wide drop-shadow-lg">{(lightboxIndex ?? 0) + 1} of {photos.length}</p>
                </div>
                <button className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white/60 hover:text-white transition-all duration-300 backdrop-blur-xl hover:rotate-90 hover:scale-110" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Prev */}
            {photos.length > 1 && (
                <button className={`fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/20 text-white/50 hover:text-white transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-white/5 hover:border-white/15 ${controlsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`} onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
            )}

            {/* Next */}
            {photos.length > 1 && (
                <button className={`fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/20 text-white/50 hover:text-white transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-white/5 hover:border-white/15 ${controlsVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`} onClick={(e) => { e.stopPropagation(); handleNext(); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            )}

            {/* Bottom: thumbnails + like */}
            <div className={`fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-5 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-50 pointer-events-none transition-all duration-500 ${controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                {photos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto max-w-[65vw] pb-1 pointer-events-auto" style={{ scrollbarWidth: "none" }}>
                        {photos.map((p: Photo, idx: number) => (
                            <button key={p.id} onClick={(e) => { e.stopPropagation(); setSlideDir(idx > (lightboxIndex ?? 0) ? "left" : "right"); setLightboxIndex(idx); setImgLoaded(false); }}
                                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${idx === lightboxIndex ? "border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.2)]" : "border-transparent opacity-30 hover:opacity-70"}`}>
                                <img src={cleanUrl(p.url)} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
                {enableLikes && onLike && (
                    <button onClick={(e) => { e.stopPropagation(); onLike(currentPhoto.id); }}
                        className={`pointer-events-auto shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${likedPhotos?.has(currentPhoto.id) ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_24px_rgba(244,63,94,0.4)]" : "bg-white/8 border-white/15 text-white hover:bg-white/15"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos?.has(currentPhoto.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="text-sm font-semibold">{likedPhotos?.has(currentPhoto.id) ? "Favorited" : "Favorite"}</span>
                    </button>
                )}
            </div>

            {/* Main image container — scrollable for tall images, centered for short ones */}
            <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-20 py-24" onClick={(e) => e.stopPropagation()}>
                {!imgLoaded && (
                    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
                            <p className="text-white/20 text-xs font-medium">Loading...</p>
                        </div>
                    </div>
                )}
                <img key={currentPhoto.id} src={cleanUrl(currentPhoto.url)} alt=""
                    onLoad={() => { setImgLoaded(true); setSlideDir("none"); }}
                    className="max-w-full h-auto object-contain sm:rounded-2xl shadow-2xl select-none z-10"
                    style={{
                        opacity: imgLoaded ? 1 : 0,
                        maxWidth: 'min(100%, 1200px)',
                        transform: imgLoaded
                            ? "translateX(0) scale(1)"
                            : `translateX(${slideDir === "left" ? "40px" : slideDir === "right" ? "-40px" : "0"}) scale(0.97)`,
                        transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)",
                    }}
                    draggable={false} />
            </div>

            <style>{`
                @keyframes lbIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
            `}</style>
        </div>
    );
}
