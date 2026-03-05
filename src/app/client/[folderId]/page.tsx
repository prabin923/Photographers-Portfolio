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
    // Favorites
    allowSelection: boolean;
    favoritesName: string;
    limitSelected: boolean;
    allowComments: boolean;
    // Privacy & Requirements
    requireEmail: boolean;
    requirePhone: boolean;
    requireInfo: boolean;
    // Reviews
    allowReviews: boolean;
    reviewMessage: string;
    askReviewAfterDownload: boolean;
    // Contacts
    showShareButton: boolean;
    showBusinessCard: boolean;
    showNameOnCover: boolean;
    // Privacy
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

    const [coverColor, setCoverColor] = useState("#0f0f0f");
    const [coverAccent, setCoverAccent] = useState("#e11d48");

    const [settings, setSettings] = useState<GallerySettings>({
        galleryName: "",
        shootDate: "",
        storeUntil: "2026-03-31",
        galleryType: "client",
        allowDownloads: true,
        addWatermark: false,
        language: "English (default)",
        allowSelection: true,
        favoritesName: "Selecting photos",
        limitSelected: false,
        allowComments: false,
        requireEmail: true,
        requirePhone: false,
        requireInfo: false,
        allowReviews: true,
        reviewMessage: "Please write your review",
        askReviewAfterDownload: true,
        showShareButton: true,
        showBusinessCard: true,
        showNameOnCover: true,
        protectWithPassword: false,
        password: "",
        allowGuestAccess: false,
    });
    const [settingsSaved, setSettingsSaved] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const galleryLink = `http://localhost:3000/client/${folderId}`;

    const fetchDrive = useCallback(() => {
        fetch(`http://localhost:4000/api/drive/client/${folderId}`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => {
                const name = data.clientName || "Your Gallery";
                setClientName(name);
                setImages(data.images || []);
                setVideos(data.videos || []);
                setLikedPhotos(new Set(data.favorites || []));
                setCoverColor(data.coverColor || "#0f0f0f");
                setCoverAccent(data.coverAccent || "#e11d48");
                setSettings({
                    galleryName: name,
                    shootDate: data.shootDate || "",
                    storeUntil: data.storeUntil || "2026-03-31",
                    galleryType: data.galleryType || "client",
                    allowDownloads: data.allowDownloads !== undefined ? data.allowDownloads : true,
                    addWatermark: data.addWatermark || false,
                    language: data.language || "English (default)",
                    allowSelection: data.allowSelection !== undefined ? data.allowSelection : true,
                    favoritesName: data.favoritesName || "Selecting photos",
                    limitSelected: data.limitSelected || false,
                    allowComments: data.allowComments || false,
                    requireEmail: data.requireEmail !== undefined ? data.requireEmail : true,
                    requirePhone: data.requirePhone || false,
                    requireInfo: data.requireInfo || false,
                    allowReviews: data.allowReviews !== undefined ? data.allowReviews : true,
                    reviewMessage: data.reviewMessage || "Please write your review",
                    askReviewAfterDownload: data.askReviewAfterDownload !== undefined ? data.askReviewAfterDownload : true,
                    showShareButton: data.showShareButton !== undefined ? data.showShareButton : true,
                    showBusinessCard: data.showBusinessCard !== undefined ? data.showBusinessCard : true,
                    showNameOnCover: data.showNameOnCover !== undefined ? data.showNameOnCover : true,
                    protectWithPassword: data.protectWithPassword || false,
                    password: data.password || "",
                    allowGuestAccess: data.allowGuestAccess || false,
                });
                setIsLoading(false);
            })
            .catch(() => { setError("Failed to load gallery."); setIsLoading(false); });
    }, [folderId]);

    useEffect(() => { fetchDrive(); }, [fetchDrive]);

    const handleLike = async (id: string) => {
        const nextLiked = new Set(likedPhotos);
        nextLiked.has(id) ? nextLiked.delete(id) : nextLiked.add(id);

        // Optimistic UI update
        setLikedPhotos(nextLiked);

        // Sync with backend
        try {
            await fetch(`http://localhost:4000/api/drives/${folderId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favorites: Array.from(nextLiked) })
            });
        } catch (e) {
            console.error("Failed to sync favorites:", e);
        }
    };

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"));
        setUploadFiles(prev => [...prev, ...dropped]);
    };

    const handleUpload = async () => {
        if (!uploadFiles.length) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            uploadFiles.forEach(f => formData.append("files", f));
            const res = await fetch(`http://localhost:4000/api/drives/${folderId}/upload`, { method: "PATCH", body: formData });
            if (!res.ok) throw new Error();
            setUploadFiles([]); setUploadSuccess(true); fetchDrive();
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch { alert("Upload failed."); }
        finally { setIsUploading(false); }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/drives/${folderId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientName: settings.galleryName,
                    ...settings,
                    coverColor,
                    coverAccent
                })
            });
            if (!res.ok) throw new Error();
            setClientName(settings.galleryName || clientName);
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2500);
        } catch (e) {
            alert("Failed to save settings.");
        }
    };

    const handleDeleteGallery = async () => {
        if (!confirm("Delete this gallery? This cannot be undone.")) return;

        try {
            const res = await fetch(`http://localhost:4000/api/drives/${folderId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                alert("Gallery deleted successfully.");
                router.push("/admin");
            } else {
                const data = await res.json();
                alert(`Failed to delete gallery: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting the gallery.");
        }
    };

    const favoritePhotos = images.filter(p => likedPhotos.has(p.id));

    if (error) return (
        <div className="flex-1 flex items-center justify-center min-h-[50vh] px-6">
            <div className="text-center max-w-md">
                <p className="text-5xl mb-4">🔒</p>
                <h2 className="text-2xl font-bold mb-2">Gallery Not Found</h2>
                <p className="text-muted-foreground mb-6">This gallery link is invalid or has expired.</p>
                <Link href="/client" className="underline text-sm">← Back to all galleries</Link>
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Loading secure drive...</p>
            </div>
        </div>
    );

    const navTabs: { id: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
        { id: "gallery", label: "Gallery", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { id: "favorites", label: "Favorites", badge: likedPhotos.size || undefined, icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={likedPhotos.size > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
        { id: "settings", label: "Settings", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { id: "design", label: "Design and cover", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
    ];

    const settingsTabList: SettingsTab[] = ["Main", "Favorites", "Products", "Reviews", "Contacts", "Privacy"];

    return (
        <div className="min-h-screen bg-premium-gradient text-white font-sans overflow-y-auto custom-scrollbar flex flex-col">
            {/* Sticky Header */}
            <div className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-40 transition-all duration-500">
                <div className="container mx-auto px-10 pt-8">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-white transition-all mb-4 group tracking-widest uppercase">
                        <div className="p-1 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </div>
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-gradient">{clientName}</h1>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Secure Client Sanctuary · {images.length + videos.length} Media Assets
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => window.open(galleryLink, '_blank')} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 01-2 2h14a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                LIVE PREVIEW
                            </button>
                            <button onClick={handleSaveSettings} className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-xs font-black hover:bg-blue-500 transition-all accent-glow active:scale-95">
                                {settingsSaved ? "CHANGES SAVED" : "SAVE CONFIGURATION"}
                            </button>
                        </div>
                    </div>
                    <nav className="flex gap-4 overflow-x-auto scrollbar-none border-t border-white/5">
                        {navTabs.map(tab => (
                            <button key={tab.id} onClick={() => setSection(tab.id)}
                                className={`flex items-center gap-2.5 px-6 py-5 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${section === tab.id ? "border-blue-500 text-white" : "border-transparent text-white/20 hover:text-white/40"}`}>
                                {tab.icon}
                                {tab.label}
                                {tab.badge !== undefined && <span className="ml-1 bg-white/10 text-white text-[10px] rounded-lg px-2 py-0.5 leading-none">{tab.badge}</span>}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8 flex-1">

                {/* ── GALLERY ── */}
                {section === "gallery" && (
                    <div className="slide-up">
                        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                            <div className="inline-flex glass-dark p-1.5 rounded-2xl border border-white/5">
                                <button onClick={() => setMediaTab("images")} className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mediaTab === "images" ? "bg-white text-black shadow-xl" : "text-white/30 hover:text-white"}`}>Photos · {images.length}</button>
                                <button onClick={() => setMediaTab("videos")} className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mediaTab === "videos" ? "bg-white text-black shadow-xl" : "text-white/30 hover:text-white"}`}>Videos · {videos.length}</button>
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hidden sm:block">Click assets for immersive view · Heart to curate favorites</p>
                        </div>

                        {/* Drop Zone */}
                        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
                            className={`mb-10 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all duration-500 relative group/drop overflow-hidden ${isDragging ? "border-blue-500 bg-blue-500/5 scale-[1.005]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"}`}>
                            <div className="absolute inset-0 bg-blue-500/0 group-hover/drop:bg-blue-500/[0.02] transition-colors" />
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3 group-hover/drop:scale-110 group-hover/drop:bg-blue-500/10 transition-all duration-500 relative z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/20 group-hover/drop:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                            </div>
                            <p className="text-sm font-bold text-white/40 relative z-10">Select files or <span className="text-white">drag & drop</span></p>
                            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => { if (e.target.files) setUploadFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                        </div>

                        {uploadFiles.length > 0 && (
                            <div className="mb-6 p-4 rounded-2xl border border-muted bg-muted/20">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold">{uploadFiles.length} file(s) ready</p>
                                    <button onClick={handleUpload} disabled={isUploading} className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                                        {isUploading ? <><div className="w-3 h-3 border border-background border-t-transparent rounded-full animate-spin" />Uploading...</> : "Upload All"}
                                    </button>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {uploadFiles.map((f, i) => (
                                        <span key={i} className="flex items-center gap-1.5 text-xs bg-background border border-muted px-3 py-1.5 rounded-full">
                                            {f.type.startsWith("image/") ? "🖼️" : "🎬"} <span className="max-w-[120px] truncate">{f.name}</span>
                                            <button onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground ml-1">✕</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {uploadSuccess && <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm text-center">✓ Files uploaded successfully!</div>}

                        {mediaTab === "images" ? (
                            <PhotoGrid photos={images} enableLikes onLike={handleLike} likedPhotos={likedPhotos} />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.length === 0 ? <p className="col-span-3 text-center py-20 text-muted-foreground">No videos yet.</p> : videos.map(vid => (
                                    <div key={vid.id} className="group flex flex-col gap-2">
                                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-muted">
                                            <video src={vid.url} controls className="w-full h-full object-cover" />
                                            <button onClick={() => handleLike(vid.id)} className={`absolute top-3 right-3 p-2 rounded-full border transition-all ${likedPhotos.has(vid.id) ? "bg-rose-500 border-rose-500 text-white" : "bg-black/30 border-white/10 text-white opacity-0 group-hover:opacity-100"}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedPhotos.has(vid.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-sm font-medium truncate px-1">{vid.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── FAVORITES ── */}
                {section === "favorites" && (
                    <div className="slide-up">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Curated Favorites</h2>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{likedPhotos.size} items have been chosen</p>
                            </div>
                            {likedPhotos.size > 0 && (
                                <button onClick={() => alert(`Downloading ${likedPhotos.size} favorites...`)} className="px-6 py-3 rounded-2xl bg-white text-black text-xs font-black hover:bg-white/90 transition-all flex items-center gap-2 shadow-xl active:scale-95">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    DOWNLOAD ALL
                                </button>
                            )}
                        </div>
                        {likedPhotos.size === 0 ? (
                            <div className="glass-dark border border-white/5 rounded-[3rem] py-32 text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <p className="text-4xl text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]">🤍</p>
                                </div>
                                <h3 className="text-lg font-bold mb-2">No favorites captured yet</h3>
                                <p className="text-white/30 text-xs font-medium mb-8">Heart photos in the main gallery to curate your collection.</p>
                                <button onClick={() => setSection("gallery")} className="text-xs font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">Explore Gallery →</button>
                            </div>
                        ) : <PhotoGrid photos={favoritePhotos} enableLikes onLike={handleLike} likedPhotos={likedPhotos} />}
                    </div>
                )}

                {/* ── SETTINGS ── */}
                {section === "settings" && (
                    <div className="max-w-3xl slide-up">
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mb-10">Advanced Gallery Orchestration</p>

                        {/* Settings sub-tabs */}
                        <div className="flex gap-2 border-b border-white/5 mb-10 overflow-x-auto scrollbar-none">
                            {settingsTabList.map(tab => (
                                <button key={tab} onClick={() => setSettingsTab(tab)}
                                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${settingsTab === tab ? "border-blue-500 text-white" : "border-transparent text-white/20 hover:text-white"}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Main */}
                        {settingsTab === "Main" && (
                            <div className="space-y-10 animate-fade-in">
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 ml-1">Gallery Identity</label>
                                    <input type="text" value={settings.galleryName} onChange={e => setSettings(s => ({ ...s, galleryName: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-white/20 transition-all placeholder:text-white/10" placeholder="e.g. Masterpiece Wedding 2024" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 ml-1">Access Channel</label>
                                    <div className="flex items-center border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02] group">
                                        <span className="text-[10px] font-black text-white/20 px-6 py-4 border-r border-white/5 shrink-0 bg-white/[0.01]">LENSDRIVE.COM/CL/</span>
                                        <span className="text-sm font-mono flex-1 px-6 truncate font-bold">{folderId}</span>
                                        <button onClick={() => navigator.clipboard.writeText(galleryLink)} className="shrink-0 px-6 py-4 text-[10px] font-black text-blue-400 hover:text-white hover:bg-blue-600 transition-all border-l border-white/5 uppercase tracking-widest">Copy Link</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 ml-1">Production Date</label>
                                        <input type="date" value={settings.shootDate} onChange={e => setSettings(s => ({ ...s, shootDate: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-white/20 transition-all text-white inverted-scheme" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 ml-1">Persistence Until</label>
                                        <div className="relative">
                                            <input type="date" value={settings.storeUntil} onChange={e => setSettings(s => ({ ...s, storeUntil: e.target.value }))} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-white/20 transition-all text-white inverted-scheme" />
                                            {settings.storeUntil && <button onClick={() => setSettings(s => ({ ...s, storeUntil: "" }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white text-xs shrink-0">✕</button>}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 ml-1">Environment Classification</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button onClick={() => setSettings(s => ({ ...s, galleryType: "client" }))} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${settings.galleryType === "client" ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                                            <div className={`p-2 rounded-lg ${settings.galleryType === "client" ? "bg-blue-500 text-white" : "bg-white/5 text-white/30"}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><rect x="3" y="3" width="18" height="18" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" /></svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black">Private Sanctuary</p>
                                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Client delivery focused</p>
                                            </div>
                                        </button>
                                        <button onClick={() => setSettings(s => ({ ...s, galleryType: "sales" }))} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${settings.galleryType === "sales" ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                                            <div className={`p-2 rounded-lg ${settings.galleryType === "sales" ? "bg-purple-500 text-white" : "bg-white/5 text-white/30"}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19h6" /></svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black">Commercial Suite</p>
                                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Sales and licenses enabled</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                <div className="glass-dark border border-white/5 rounded-3xl divide-y divide-white/5 overflow-hidden">
                                    <div className="flex items-center justify-between px-8 py-6">
                                        <div>
                                            <p className="text-xs font-black">Unrestricted Asset Extraction</p>
                                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">Allow original high-res downloads</p>
                                        </div>
                                        <Toggle checked={settings.allowDownloads} onChange={v => setSettings(s => ({ ...s, allowDownloads: v, addWatermark: v ? false : s.addWatermark }))} />
                                    </div>
                                    <div className={`flex items-center justify-between px-8 py-6 transition-opacity duration-500 ${settings.allowDownloads ? "opacity-20 pointer-events-none" : ""}`}>
                                        <div>
                                            <p className="text-xs font-black">Visual Metadata (Watermark)</p>
                                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">Protect assets during preview phases</p>
                                        </div>
                                        <Toggle checked={settings.addWatermark} disabled={settings.allowDownloads} onChange={v => setSettings(s => ({ ...s, addWatermark: v }))} aria-hidden={settings.allowDownloads} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Favorites */}
                        {settingsTab === "Favorites" && (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-muted p-4 flex items-center justify-between">
                                    <p className="text-sm font-medium">Allow photo selection</p>
                                    <Toggle checked={settings.allowSelection} onChange={v => setSettings(s => ({ ...s, allowSelection: v }))} />
                                </div>
                                <p className="text-xs text-muted-foreground px-1">Clients can add files to Favorites to select photos for retouching, printing, and more.</p>
                                <div className="rounded-xl border border-muted divide-y divide-muted/50 overflow-hidden">
                                    <div className="p-4">
                                        <p className="text-sm font-semibold mb-3">Favorites name</p>
                                        <input type="text" value={settings.favoritesName} onChange={e => setSettings(s => ({ ...s, favoritesName: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm" />
                                        <p className="text-xs text-muted-foreground mt-2">Clients will see this name when they create Favorites.</p>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4"><p className="text-sm font-medium">Limit selected photos</p><Toggle checked={settings.limitSelected} onChange={v => setSettings(s => ({ ...s, limitSelected: v }))} /></div>
                                    <div className="flex items-center justify-between px-4 py-4"><p className="text-sm font-medium">Allow comments</p><Toggle checked={settings.allowComments} onChange={v => setSettings(s => ({ ...s, allowComments: v }))} /></div>
                                </div>
                                <div className="rounded-xl border border-muted divide-y divide-muted/50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <div>
                                            <p className="text-sm font-medium">Client name</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Name format is set in the <span className="text-foreground underline cursor-pointer">Drive settings</span>.</p>
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Required
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <div><p className="text-sm font-medium">Require email</p><p className="text-xs text-muted-foreground mt-0.5">Clients will receive an email with a link to their Favorites.</p></div>
                                        <Toggle checked={settings.requireEmail} onChange={v => setSettings(s => ({ ...s, requireEmail: v }))} />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4"><p className="text-sm font-medium">Require phone number</p><Toggle checked={settings.requirePhone} onChange={v => setSettings(s => ({ ...s, requirePhone: v }))} /></div>
                                    <div className="flex items-center justify-between px-4 py-4"><p className="text-sm font-medium">Require additional info</p><Toggle checked={settings.requireInfo} onChange={v => setSettings(s => ({ ...s, requireInfo: v }))} /></div>
                                </div>
                                <p className="text-xs text-muted-foreground px-1">Client name is required. Enable extra fields if you need more details from the client.</p>
                            </div>
                        )}

                        {/* Products */}
                        {settingsTab === "Products" && <div className="text-center py-16"><p className="text-4xl mb-3">🛒</p><h3 className="font-semibold mb-2">Products</h3><p className="text-sm text-muted-foreground">Set up print products, packages, and digital downloads for sale here.</p></div>}

                        {/* Reviews */}
                        {settingsTab === "Reviews" && (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-muted p-4 flex items-center justify-between">
                                    <p className="text-sm font-medium">Allow reviews</p>
                                    <Toggle checked={settings.allowReviews} onChange={v => setSettings(s => ({ ...s, allowReviews: v }))} />
                                </div>
                                <div className="rounded-xl border border-muted p-4">
                                    <label className="block text-sm font-semibold mb-2">Review message</label>
                                    <textarea
                                        value={settings.reviewMessage}
                                        onChange={e => setSettings(s => ({ ...s, reviewMessage: e.target.value }))}
                                        className="w-full h-24 px-4 py-3 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Ask for specific and meaningful feedback.</p>
                                </div>
                                <div className="rounded-xl border border-muted p-4 flex items-center justify-between">
                                    <p className="text-sm font-medium">Ask for a review after download</p>
                                    <Toggle checked={settings.askReviewAfterDownload} onChange={v => setSettings(s => ({ ...s, askReviewAfterDownload: v }))} />
                                </div>
                            </div>
                        )}

                        {/* Contacts */}
                        {settingsTab === "Contacts" && (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-muted divide-y divide-muted/50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <p className="text-sm font-medium">Show Share button</p>
                                        <Toggle checked={settings.showShareButton} onChange={v => setSettings(s => ({ ...s, showShareButton: v }))} />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <p className="text-sm font-medium">Show Business card widget</p>
                                        <Toggle checked={settings.showBusinessCard} onChange={v => setSettings(s => ({ ...s, showBusinessCard: v }))} />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <p className="text-sm font-medium">Show your name and website on cover</p>
                                        <Toggle checked={settings.showNameOnCover} onChange={v => setSettings(s => ({ ...s, showNameOnCover: v }))} />
                                    </div>
                                </div>
                                <div className="text-center py-8 opacity-50">
                                    <p className="text-xs text-muted-foreground italic">Business info is pulled from your profile settings.</p>
                                </div>
                            </div>
                        )}

                        {/* Privacy */}
                        {settingsTab === "Privacy" && (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-muted p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-medium">Protect with a password</p>
                                        <Toggle checked={settings.protectWithPassword} onChange={v => setSettings(s => ({ ...s, protectWithPassword: v }))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={settings.password}
                                                onChange={e => setSettings(s => ({ ...s, password: e.target.value }))}
                                                placeholder="e.g. 54321"
                                                className="w-full px-4 py-2.5 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm font-mono pr-10"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4">
                                        Visitors need a password to view the gallery. With password access, hidden folders and saved Favorites become available.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-muted p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium">Allow guest access</p>
                                        <Toggle checked={settings.allowGuestAccess} onChange={v => setSettings(s => ({ ...s, allowGuestAccess: v }))} />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Guests can view the gallery without a password, but they will not see hidden folders or saved Favorites.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-muted">
                            <button onClick={handleDeleteGallery} className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Delete gallery
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => setSection("gallery")} className="px-5 py-2.5 rounded-full border border-muted text-sm hover:bg-muted transition-colors">Cancel</button>
                                <button onClick={handleSaveSettings} className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity">
                                    {settingsSaved ? "✓ Saved!" : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── DESIGN & COVER ── */}
                {section === "design" && (
                    <div className="max-w-4xl slide-up">
                        <div className="mb-10">
                            <h2 className="text-2xl font-black tracking-tight">Aesthetic Curation</h2>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Sculpt the visual persona of this sanctuary</p>
                        </div>

                        <div className="relative w-full h-[400px] rounded-[3rem] overflow-hidden mb-12 shadow-2xl flex items-end p-12 transition-all duration-700 bg-black/40 border border-white/5" style={{ background: `linear-gradient(135deg, ${coverColor} 0%, ${coverAccent}33 100%)` }}>
                            {images[0]?.url && (
                                <img src={images[0].url} alt="cover" className="absolute inset-0 w-full h-full object-cover opacity-20 hover:opacity-30 transition-opacity duration-700" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                            <div className="relative z-10 slide-up">
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-4">EXCLUSIVE SECURE DRIVE</p>
                                <h3 className="text-white text-6xl font-black tracking-tighter mb-4 text-gradient">{clientName}</h3>
                                <div className="flex items-center gap-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{images.length + videos.length} ASSETS STAGED</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                            <div className="glass-dark p-8 rounded-[2rem] border border-white/5">
                                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6 ml-1">Universal Hue</label>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <input type="color" value={coverColor} onChange={e => setCoverColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                                        <span className="text-xs font-mono font-bold text-white/40 tracking-widest uppercase">{coverColor}</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full" style={{ background: coverColor }}></div>
                                </div>
                            </div>
                            <div className="glass-dark p-8 rounded-[2rem] border border-white/5">
                                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6 ml-1">Accent Vibration</label>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <input type="color" value={coverAccent} onChange={e => setCoverAccent(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent" />
                                        <span className="text-xs font-mono font-bold text-white/40 tracking-widest uppercase">{coverAccent}</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full accent-glow" style={{ background: coverAccent }}></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6 ml-1">Cover Asset Selection</label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-4 mb-12">
                                {images.slice(0, 16).map((img, idx) => (
                                    <button key={idx} className="aspect-square rounded-2xl overflow-hidden border-2 border-white/5 hover:border-blue-500 hover:scale-105 transition-all shadow-xl group">
                                        <img src={img.url} alt="" className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                                    </button>
                                ))}
                                {images.length === 0 && <p className="text-[11px] font-bold text-white/20 col-span-8 py-10 text-center italic border-2 border-dashed border-white/5 rounded-3xl">No visual assets available for selection.</p>}
                            </div>
                        </div>
                        <button onClick={handleSaveSettings} className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all accent-glow active:scale-95 shadow-2xl">
                            COMMIT DESIGN CHANGES
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-none { scrollbar-width: none; }
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .inverted-scheme::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.3;
                    cursor: pointer;
                }
                .inverted-scheme::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
