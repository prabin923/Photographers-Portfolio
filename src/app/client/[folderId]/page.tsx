"use client";

import PhotoGrid, { Photo } from "@/components/PhotoGrid";
import React, { useState, useEffect, use, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Section = "gallery" | "favorites" | "settings" | "design";
type SettingsTab = "Main" | "Favorites" | "Products" | "Reviews" | "Contacts" | "Privacy";

interface GallerySettings {
    galleryName: string;
    shootDate: string;
    storeUntil: string;
    galleryType: "client" | "sales";
    allowDownloads: boolean;
    addWatermark: boolean;
    language: string;
    allowSelection: boolean;
    favoritesName: string;
    limitSelected: boolean;
    allowComments: boolean;
    requireEmail: boolean;
    requirePhone: boolean;
    requireInfo: boolean;
    allowReviews: boolean;
    reviewMessage: string;
    askReviewAfterDownload: boolean;
    showShareButton: boolean;
    showBusinessCard: boolean;
    showNameOnCover: boolean;
    protectWithPassword: boolean;
    password: string;
    allowGuestAccess: boolean;
}

const Toggle = ({ checked = false, disabled = false, onChange, id }: { checked?: boolean; disabled?: boolean; onChange?: (v: boolean) => void; id?: string }) => (
    <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
        <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange?.(e.target.checked)} className="sr-only peer" id={id} />
        <div className={`w-11 h-6 bg-white/5 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 border border-white/5 ${disabled ? "opacity-20" : ""}`} />
    </label>
);

export default function ClientDrivePage({ params }: { params: Promise<{ folderId: string }> }) {
    const resolvedParams = use(params);
    const folderId = resolvedParams.folderId;
    const router = useRouter();

    const [section, setSection] = useState<Section>("gallery");
    const [settingsTab, setSettingsTab] = useState<SettingsTab>("Main");
    const [mediaTab, setMediaTab] = useState<"images" | "videos">("images");
    const [clientName, setClientName] = useState("Your Gallery");
    const [images, setImages] = useState<Photo[]>([]);
    const [videos, setVideos] = useState<Photo[]>([]);
    const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isExploring, setIsExploring] = useState(false);

    const [coverColor, setCoverColor] = useState("#0f0f0f");
    const [coverAccent, setCoverAccent] = useState("#e11d48");
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const [settings, setSettings] = useState<GallerySettings>({
        galleryName: "",
        shootDate: "",
        storeUntil: "2026-12-31",
        galleryType: "client",
        allowDownloads: true,
        addWatermark: false,
        language: "English (default)",
        allowSelection: true,
        favoritesName: "Selection",
        limitSelected: false,
        allowComments: false,
        requireEmail: true,
        requirePhone: false,
        requireInfo: false,
        allowReviews: true,
        reviewMessage: "Would you like to leave a review?",
        askReviewAfterDownload: true,
        showShareButton: true,
        showBusinessCard: true,
        showNameOnCover: true,
        protectWithPassword: false,
        password: "",
        allowGuestAccess: false,
    });

    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDrive = useCallback(() => {
        fetch(`/api/drive/client/${folderId}`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => {
                setClientName(data.clientName || "Your Gallery");
                setImages(data.images || []);
                setVideos(data.videos || []);
                setLikedPhotos(new Set(data.favorites || []));
                setCoverColor(data.coverColor || "#0f0f0f");
                setCoverAccent(data.coverAccent || "#e11d48");
                setSettings(prev => ({ ...prev, ...data, galleryName: data.clientName || prev.galleryName }));
                setIsLoading(false);
            })
            .catch(() => { setError("Gallery not found."); setIsLoading(false); });
    }, [folderId]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) setIsAdmin(true);
        }
        fetchDrive();
    }, [fetchDrive]);

    const handleLike = async (id: string) => {
        const nextLiked = new Set(likedPhotos);
        nextLiked.has(id) ? nextLiked.delete(id) : nextLiked.add(id);
        setLikedPhotos(nextLiked);
        try {
            await fetch(`/api/drives/${folderId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favorites: Array.from(nextLiked) })
            });
        } catch (e) { console.error("Sync failed", e); }
    };

    const handleUpload = async () => {
        if (!uploadFiles.length) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            uploadFiles.forEach(f => formData.append("files", f));
            const res = await fetch(`/api/drives/${folderId}/upload`, { method: "PATCH", body: formData });
            if (res.ok) { setUploadFiles([]); setUploadSuccess(true); fetchDrive(); setTimeout(() => setUploadSuccess(false), 3000); }
        } catch { alert("Upload error"); }
        finally { setIsUploading(false); }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch(`/api/drives/${folderId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...settings, clientName: settings.galleryName, coverColor, coverAccent })
            });
            if (res.ok) { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000); }
        } catch { alert("Save failed"); }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    if (error) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="text-center animate-fade-in">
                <div className="w-24 h-24 rounded-[3rem] bg-white/5 flex items-center justify-center mx-auto mb-8 text-6xl shadow-2xl">🔒</div>
                <h1 className="text-3xl font-black tracking-tighter text-white mb-3">Access Restricted</h1>
                <p className="text-white/30 text-sm mb-10 max-w-xs mx-auto">This gallery is either private, expired, or the link is incorrect.</p>
                <Link href="/" className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400 hover:text-white transition-all underline underline-offset-8">Return Home</Link>
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="text-center animate-pulse">
                <div className="w-16 h-16 border-2 border-white/5 border-t-white/40 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">Loading Visuals</p>
            </div>
        </div>
    );

    const coverImg = images[0]?.url;

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
            
            {/* ── CINEMATIC ENTRANCE HERO ── */}
            {!isExploring && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden animate-fade-in">
                    {coverImg && (
                        <div className="absolute inset-0 opacity-40">
                            <img src={coverImg} alt="" className="w-full h-full object-cover scale-[1.05] blur-[2px]" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    
                    <div className="relative z-10 text-center px-8">
                        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in delay-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse"></span>
                            <span className="text-emerald-400/80 text-[10px] font-black uppercase tracking-[0.5em]">Private Invitation</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-8 border-b border-white/5 pb-12 leading-[0.85] animate-fade-in delay-200">
                            {clientName}
                        </h1>
                        <div className="flex flex-col items-center gap-10 animate-fade-in delay-300">
                            <button 
                                onClick={() => setIsExploring(true)}
                                className="group relative px-14 py-6 rounded-full overflow-hidden transition-all duration-700 hover:scale-110 active:scale-95 shadow-2xl shadow-white/5"
                            >
                                <div className="absolute inset-0 bg-white group-hover:bg-blue-600 transition-colors duration-700"></div>
                                <span className="relative z-10 text-black group-hover:text-white text-[12px] font-black uppercase tracking-[0.4em]">Explore Gallery</span>
                            </button>
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Curated by {clientName.split(' ')[0]}</p>
                        </div>
                    </div>
                    
                    {/* Bottom stats blur */}
                    <div className="absolute bottom-12 left-0 right-0 px-12 flex justify-between items-end opacity-20 pointer-events-none">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Total Assets</span>
                            <span className="text-5xl font-black tracking-tighter">{images.length + videos.length}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Studio Quality</span>
                            <p className="text-xs font-bold mt-1 uppercase tracking-widest underline decoration-white/20">Ready for Download</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MAIN CONTENT ── */}
            <div className={`relative transition-all duration-1000 ${isExploring ? "opacity-100" : "opacity-0 translate-y-20 scale-110 pointer-events-none"}`}>
                
                {/* Immersive Cover Header */}
                <header className="relative h-[85vh] flex items-end overflow-hidden">
                    {coverImg && <img src={coverImg} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    <div 
                        className="absolute inset-0 shadow-inner" 
                        style={{ background: `linear-gradient(to top, #050505 0%, transparent 60%), linear-gradient(to right, #050505cc 0%, transparent 40%)` }}
                    ></div>
                    
                    {/* Top Admin Tools (Hidden from clients) */}
                    <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-50">
                        <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-3xl border border-white/8 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            {isAdmin ? "Admin Dashboard" : "Main Site"}
                        </Link>
                        
                        <div className="flex items-center gap-3">
                            <button onClick={handleCopy} className="p-4 rounded-full bg-white/5 backdrop-blur-3xl border border-white/8 hover:bg-white/10 transition-all">
                                {linkCopied ? <span className="text-[10px] font-black uppercase text-emerald-400">Copied!</span> : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                            </button>
                            {isAdmin && (
                                <button onClick={handleSaveSettings} className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 transition-all text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/20">
                                    {settingsSaved ? "Saved ✓" : "Commit Changes"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 p-12 w-full max-w-6xl animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-3xl border border-white/10 text-[9px] font-black uppercase tracking-[0.3em]">{settings.galleryType} Edition</div>
                            {settings.shootDate && <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{new Date(settings.shootDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase leading-none">{clientName}</h1>
                        <p className="text-white/40 text-sm font-medium tracking-wide max-w-xl leading-relaxed">
                            A curated legacy of moments, captured and preserved with intent. Authenticity in every frame, depth in every shadow.
                        </p>
                    </div>
                </header>

                {/* ── NAVIGATION ── */}
                <nav className="sticky top-0 z-[60] bg-[#050505]/80 backdrop-blur-3xl border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-10 flex items-center justify-between h-20">
                        <div className="flex items-center gap-1">
                            {([
                                { id: "gallery", label: "Collection", count: images.length + videos.length },
                                { id: "favorites", label: "My Favorites", count: likedPhotos.size },
                                ...(isAdmin ? [
                                    { id: "settings", label: "Management" },
                                    { id: "design", label: "Atmosphere" },
                                ] : [])
                            ] as { id: Section; label: string; count?: number }[]).map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setSection(tab.id)}
                                    className={`relative group px-6 py-4 transition-all duration-300`}
                                >
                                    <span className={`text-[11px] font-black uppercase tracking-[0.3em] transition-colors ${section === tab.id ? "text-white" : "text-white/25 group-hover:text-white/60"}`}>
                                        {tab.label}
                                    </span>
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-[0.5rem] font-black ${section === tab.id ? "bg-white text-black" : "bg-white/10 text-white/40"}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {section === tab.id && <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-white rounded-t-full shadow-[0_0_12px_rgba(255,255,255,0.4)]"></div>}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-6">
                            {section === "gallery" && (
                                <div className="flex bg-white/5 rounded-full p-1 border border-white/8">
                                    <button onClick={() => setMediaTab("images")} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mediaTab === "images" ? "bg-white text-black" : "text-white/30 hover:text-white"}`}>Visuals</button>
                                    <button onClick={() => setMediaTab("videos")} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mediaTab === "videos" ? "bg-white text-black" : "text-white/30 hover:text-white"}`}>Reels</button>
                                </div>
                            )}
                            {likedPhotos.size > 0 && (
                                <button className="px-8 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-xl">Batch Export</button>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── VIEWPORT ── */}
                <main className="max-w-7xl mx-auto px-10 py-20 min-h-[50vh]">
                    
                    {/* Collection View */}
                    {section === "gallery" && (
                        <div className="animate-fade-in">
                            {isAdmin && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative h-48 mb-20 rounded-[3rem] border-2 border-dashed border-white/10 bg-white/[0.01] hover:bg-blue-600/5 hover:border-blue-500/30 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-4 transition-transform duration-700 group-hover:-translate-y-2">
                                        <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-all">Expand Collection</p>
                                            <p className="text-[9px] text-white/10 mt-2 uppercase font-bold tracking-widest">Supports high-res Visuals & Reels</p>
                                        </div>
                                    </div>
                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => e.target.files && setUploadFiles(Array.from(e.target.files))} />
                                </div>
                            )}

                            {uploadFiles.length > 0 && (
                                <div className="fixed bottom-10 left-10 right-10 z-[100] p-6 rounded-[2.5rem] bg-white text-black flex items-center justify-between shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-fade-in">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white text-sm font-black">{uploadFiles.length}</div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest leading-none">Preparing Assets</p>
                                            <p className="text-[10px] font-medium opacity-50 mt-1.5">Your files are being optimized for delivery.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setUploadFiles([])} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">Abort</button>
                                        <button onClick={handleUpload} disabled={isUploading} className="px-10 py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">{isUploading ? "Optimizing..." : "Initialize Upload"}</button>
                                    </div>
                                </div>
                            )}

                            <PhotoGrid photos={mediaTab === "images" ? images : videos} enableLikes={settings.allowSelection} onLike={handleLike} likedPhotos={likedPhotos} />
                        </div>
                    )}

                    {/* Favorites View */}
                    {section === "favorites" && (
                        <div className="animate-fade-in">
                            <div className="flex flex-col items-center justify-center py-40 border border-white/5 rounded-[4rem] bg-white/[0.01]">
                                {likedPhotos.size === 0 ? (
                                    <>
                                        <div className="w-32 h-32 rounded-[3.5rem] bg-white/5 flex items-center justify-center mb-10 text-6xl opacity-20 rotate-[15deg]">♥</div>
                                        <h2 className="text-3xl font-black tracking-tighter mb-4">Your selection is empty</h2>
                                        <p className="text-white/30 text-sm max-w-xs text-center leading-relaxed mb-12">Capture your favorite moments by hearting them in the collection.</p>
                                        <button onClick={() => setSection("gallery")} className="px-12 py-5 rounded-full border border-white/10 hover:border-white transition-all text-[11px] font-black uppercase tracking-[0.4em]">Browse Visuals</button>
                                    </>
                                ) : (
                                    <div className="w-full px-10">
                                        <div className="flex items-center justify-between mb-16 px-4">
                                            <div>
                                                <h2 className="text-4xl font-black tracking-tighter leading-none mb-3">Saved Moments</h2>
                                                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">{likedPhotos.size} items preserved</p>
                                            </div>
                                            <button className="px-10 py-5 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-400 transition-all">Bulk Download</button>
                                        </div>
                                        <PhotoGrid photos={images.filter(img => likedPhotos.has(img.id))} enableLikes onLike={handleLike} likedPhotos={likedPhotos} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Management View (Admin only) */}
                    {section === "settings" && isAdmin && (
                        <div className="max-w-4xl mx-auto animate-fade-in grid grid-cols-1 md:grid-cols-[280px_1fr] gap-20">
                            <aside className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8">System settings</p>
                                {(["Main", "Favorites", "Products", "Reviews", "Contacts", "Privacy"] as SettingsTab[]).map((tab: SettingsTab) => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setSettingsTab(tab)}
                                        className={`w-full text-left px-8 py-5 rounded-[1.5rem] transition-all duration-300 ${settingsTab === tab ? "bg-white text-black font-black" : "text-white/30 hover:bg-white/5 hover:text-white font-bold"}`}
                                    >
                                        <span className="text-[11px] uppercase tracking-widest">{tab}</span>
                                    </button>
                                ))}
                            </aside>
                            
                            <div className="space-y-12">
                                {settingsTab === "Main" && (
                                    <div className="space-y-10 animate-fade-in">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Display Name</label>
                                            <input type="text" value={settings.galleryName} onChange={e => setSettings(s => ({ ...s, galleryName: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl px-8 py-6 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-white/20 outline-none transition-all" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Capture Date</label>
                                                <input type="date" value={settings.shootDate} onChange={e => setSettings(s => ({ ...s, shootDate: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl px-8 py-6 text-sm font-bold [color-scheme:dark]" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Retention until</label>
                                                <input type="date" value={settings.storeUntil} onChange={e => setSettings(s => ({ ...s, storeUntil: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl px-8 py-6 text-sm font-bold [color-scheme:dark]" />
                                            </div>
                                        </div>
                                        <div className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                                            {[
                                                { label: "High-Res Downloads", sub: "Enable original file exports", key: "allowDownloads" as keyof GallerySettings },
                                                { label: "IP Watermarking", sub: "Inject protection on previews", key: "addWatermark" as keyof GallerySettings },
                                            ].map(item => (
                                                <div key={item.key} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-black tracking-tight">{item.label}</p>
                                                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1.5">{item.sub}</p>
                                                    </div>
                                                    <Toggle checked={settings[item.key] as boolean} onChange={v => setSettings(s => ({ ...s, [item.key]: v }))} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {settingsTab !== "Main" && (
                                    <div className="py-20 text-center animate-fade-in border border-white/5 rounded-[4rem] bg-white/[0.01]">
                                        <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-8 text-4xl opacity-10 rotate-12">⚙</div>
                                        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">{settingsTab} Module Active</p>
                                        <p className="text-white/10 text-[9px] font-bold uppercase tracking-widest mt-3">Advanced configuration pending initialization</p>
                                    </div>
                                )}
                                <div className="pt-12 border-t border-white/5 flex gap-4">
                                    <button onClick={handleSaveSettings} className="flex-1 py-6 rounded-[2rem] bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-400 transition-all">Synchronize settings</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Atmosphere View (Admin only) */}
                    {section === "design" && isAdmin && (
                        <div className="max-w-4xl mx-auto animate-fade-in space-y-20">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter mb-3 leading-none">Visual Atmosphere</h2>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">Tailor the brand experience</p>
                            </div>
                            
                            <div className="relative h-96 rounded-[4rem] overflow-hidden border border-white/10 group">
                                {coverImg && <img src={coverImg} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" style={{ backgroundColor: `${coverColor}88` }}></div>
                                <div className="absolute bottom-12 left-12 right-12 z-10">
                                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Live Atmosphere Preview</span>
                                    <h3 className="text-6xl font-black tracking-tighter text-white uppercase">{clientName}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                {[
                                    { label: "Primary Palette", state: coverColor, set: setCoverColor },
                                    { label: "Accent Highlight", state: coverAccent, set: setCoverAccent }
                                ].map(item => (
                                    <div key={item.label} className="p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8">{item.label}</label>
                                        <div className="flex items-center gap-6 p-4 rounded-3xl bg-black/40 border border-white/5">
                                            <input type="color" value={item.state} onChange={e => item.set(e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer bg-transparent border-0" />
                                            <span className="text-sm font-mono font-black text-white/40 uppercase tracking-widest">{item.state}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button onClick={handleSaveSettings} className="w-full py-8 rounded-[3rem] bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-400 transition-all">Propagate Visual design</button>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(30px); filter: blur(10px); } 
                    to { opacity: 1; transform: translateY(0); filter: blur(0); } 
                }
            `}</style>
        </div>
    );
}
