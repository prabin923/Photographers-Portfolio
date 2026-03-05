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
}

const Toggle = ({ defaultChecked = false, disabled = false, onChange }: { defaultChecked?: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
        <input type="checkbox" defaultChecked={defaultChecked} disabled={disabled} onChange={e => onChange?.(e.target.checked)} className="sr-only peer" />
        <div className={`w-10 h-6 bg-muted rounded-full peer peer-checked:bg-foreground transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4 ${disabled ? "opacity-40" : ""}`} />
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
                setSettings(prev => ({ ...prev, galleryName: name }));
                setIsLoading(false);
            })
            .catch(() => { setError("Failed to load gallery."); setIsLoading(false); });
    }, [folderId]);

    useEffect(() => { fetchDrive(); }, [fetchDrive]);

    const handleLike = (id: string) => setLikedPhotos(prev => {
        const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
    });

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

    const handleSaveSettings = () => {
        setClientName(settings.galleryName || clientName);
        setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2500);
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
        <div className="flex-1 flex flex-col">
            {/* Sticky Header */}
            <div className="border-b border-muted/40 bg-background/95 backdrop-blur-sm sticky top-[80px] z-40">
                <div className="container mx-auto px-6 pt-5 pb-0">
                    <Link href="/client" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        All galleries
                    </Link>
                    <h1 className="text-2xl font-bold mb-4">{clientName}</h1>
                    <nav className="flex gap-0 overflow-x-auto scrollbar-none">
                        {navTabs.map(tab => (
                            <button key={tab.id} onClick={() => setSection(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${section === tab.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"} ${tab.id === "favorites" && likedPhotos.size > 0 ? "!text-rose-500" : ""}`}>
                                <span className={tab.id === "favorites" && likedPhotos.size > 0 ? "text-rose-500" : ""}>{tab.icon}</span>
                                {tab.label}
                                {tab.badge !== undefined && <span className="ml-0.5 bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{tab.badge}</span>}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8 flex-1">

                {/* ── GALLERY ── */}
                {section === "gallery" && (
                    <div>
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                            <div className="inline-flex bg-muted/50 p-1 rounded-full border border-muted">
                                <button onClick={() => setMediaTab("images")} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mediaTab === "images" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Photos ({images.length})</button>
                                <button onClick={() => setMediaTab("videos")} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mediaTab === "videos" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Videos ({videos.length})</button>
                            </div>
                            <p className="text-xs text-muted-foreground hidden sm:block">Click any photo to view full screen · Heart to add to favorites</p>
                        </div>

                        {/* Drop Zone */}
                        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
                            className={`mb-6 flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging ? "border-foreground bg-foreground/5 scale-[1.01]" : "border-muted bg-muted/10 hover:bg-muted/20 hover:border-foreground/40"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 mb-1.5 transition-colors ${isDragging ? "text-foreground" : "text-muted-foreground"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Drag & drop</span> photos/videos here or <span className="underline">browse</span></p>
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
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <div><h2 className="text-xl font-bold">Favorites</h2><p className="text-sm text-muted-foreground mt-1">{likedPhotos.size} item{likedPhotos.size !== 1 ? "s" : ""} selected</p></div>
                            {likedPhotos.size > 0 && <button onClick={() => alert(`Downloading ${likedPhotos.size} favorites...`)} className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download All</button>}
                        </div>
                        {likedPhotos.size === 0 ? (
                            <div className="text-center py-24"><p className="text-5xl mb-4">🤍</p><h3 className="text-lg font-semibold mb-2">No favorites yet</h3><p className="text-muted-foreground text-sm mb-6">Heart photos in Gallery to add them here.</p><button onClick={() => setSection("gallery")} className="underline text-sm">Go to Gallery →</button></div>
                        ) : <PhotoGrid photos={favoritePhotos} enableLikes onLike={handleLike} likedPhotos={likedPhotos} />}
                    </div>
                )}

                {/* ── SETTINGS ── */}
                {section === "settings" && (
                    <div className="max-w-2xl">
                        <p className="text-sm text-muted-foreground mb-6">Manage gallery name, favorites, storage periods, and other important settings.</p>

                        {/* Settings sub-tabs */}
                        <div className="flex gap-0 border-b border-muted mb-8 overflow-x-auto scrollbar-none">
                            {settingsTabList.map(tab => (
                                <button key={tab} onClick={() => setSettingsTab(tab)}
                                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${settingsTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Main */}
                        {settingsTab === "Main" && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Gallery name</label>
                                    <input type="text" value={settings.galleryName} onChange={e => setSettings(s => ({ ...s, galleryName: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground transition-all text-sm" placeholder="e.g. Emma & James Wedding" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Gallery link</label>
                                    <div className="flex items-center border border-muted rounded-xl overflow-hidden bg-muted/20">
                                        <span className="text-xs text-muted-foreground px-3 py-2.5 border-r border-muted shrink-0">localhost:3000/client/</span>
                                        <span className="text-sm font-mono flex-1 px-3 truncate">{folderId}</span>
                                        <button onClick={() => navigator.clipboard.writeText(galleryLink)} className="shrink-0 px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground border-l border-muted">Copy</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Shoot date</label>
                                        <input type="date" value={settings.shootDate} onChange={e => setSettings(s => ({ ...s, shootDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Store until</label>
                                        <div className="flex items-center gap-2">
                                            <input type="date" value={settings.storeUntil} onChange={e => setSettings(s => ({ ...s, storeUntil: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm" />
                                            {settings.storeUntil && <button onClick={() => setSettings(s => ({ ...s, storeUntil: "" }))} className="text-muted-foreground hover:text-foreground text-xs shrink-0">✕</button>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Remove the date for open-ended storage.</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-3">Gallery type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setSettings(s => ({ ...s, galleryType: "client" }))} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${settings.galleryType === "client" ? "border-foreground bg-foreground/5" : "border-muted hover:border-foreground/30"}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" /></svg>Client gallery
                                        </button>
                                        <button onClick={() => setSettings(s => ({ ...s, galleryType: "sales" }))} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${settings.galleryType === "sales" ? "border-foreground bg-foreground/5" : "border-muted hover:border-foreground/30"}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19h6" /></svg>Photo sales
                                        </button>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-muted overflow-hidden divide-y divide-muted/50">
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <p className="text-sm font-medium">Allow original file downloads</p>
                                        <Toggle defaultChecked={settings.allowDownloads} onChange={v => setSettings(s => ({ ...s, allowDownloads: v, addWatermark: v ? false : s.addWatermark }))} />
                                    </div>
                                    <div className={`flex items-center justify-between px-4 py-4 ${settings.allowDownloads ? "opacity-40 pointer-events-none" : ""}`}>
                                        <div><p className="text-sm font-medium">Add watermark</p><p className="text-xs text-muted-foreground mt-0.5">Applied to photos. Available only when downloads are disabled.</p></div>
                                        <Toggle defaultChecked={settings.addWatermark} disabled={settings.allowDownloads} onChange={v => setSettings(s => ({ ...s, addWatermark: v }))} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Gallery language</label>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-muted bg-muted/10">
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
                                            <span className="text-sm">{settings.language}</span>
                                        </div>
                                        <button className="text-xs text-muted-foreground hover:text-foreground underline">Change</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Favorites */}
                        {settingsTab === "Favorites" && (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-muted p-4 flex items-center justify-between">
                                    <p className="text-sm font-medium">Allow photo selection</p>
                                    <Toggle defaultChecked />
                                </div>
                                <p className="text-xs text-muted-foreground px-1">Clients can add files to Favorites to select photos for retouching, printing, and more.</p>
                                <div className="rounded-xl border border-muted divide-y divide-muted/50 overflow-hidden">
                                    <div className="p-4">
                                        <p className="text-sm font-semibold mb-3">Favorites name</p>
                                        <input type="text" defaultValue="Selecting photos" className="w-full px-4 py-2.5 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm" />
                                        <p className="text-xs text-muted-foreground mt-2">Clients will see this name when they create Favorites.</p>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4"><p className="text-sm font-medium">Limit selected photos</p><Toggle /></div>
                                    <div className="flex items-center justify-between px-4 py-4"><p className="text-sm font-medium">Allow comments</p><Toggle /></div>
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
                                        <Toggle defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4"><p className="text-sm font-medium">Require phone number</p><Toggle /></div>
                                    <div className="flex items-center justify-between px-4 py-4"><p className="text-sm font-medium">Require additional info</p><Toggle /></div>
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
                                    <Toggle defaultChecked />
                                </div>
                                <div className="rounded-xl border border-muted p-4">
                                    <label className="block text-sm font-semibold mb-2">Review message</label>
                                    <textarea
                                        defaultValue="Please write your review"
                                        className="w-full h-24 px-4 py-3 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Ask for specific and meaningful feedback.</p>
                                </div>
                                <div className="rounded-xl border border-muted p-4 flex items-center justify-between">
                                    <p className="text-sm font-medium">Ask for a review after download</p>
                                    <Toggle defaultChecked />
                                </div>
                            </div>
                        )}

                        {/* Contacts */}
                        {settingsTab === "Contacts" && (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-muted divide-y divide-muted/50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <p className="text-sm font-medium">Show Share button</p>
                                        <Toggle defaultChecked={true} />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <p className="text-sm font-medium">Show Business card widget</p>
                                        <Toggle defaultChecked={true} />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <p className="text-sm font-medium">Show your name and website on cover</p>
                                        <Toggle defaultChecked={true} />
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
                                        <Toggle />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="e.g. 54321"
                                                className="w-full px-4 py-2.5 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm font-mono pr-10"
                                            />
                                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4">
                                        Visitors need a password to view the gallery. With password access, hidden folders and saved Favorites become available.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-muted p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium">Allow guest access</p>
                                        <Toggle />
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
                    <div className="max-w-2xl">
                        <h2 className="text-xl font-bold mb-2">Design and Cover</h2>
                        <p className="text-sm text-muted-foreground mb-8">Customize how your gallery looks for clients.</p>
                        <div className="relative w-full h-60 rounded-2xl overflow-hidden mb-8 shadow-xl flex items-end p-6" style={{ background: `linear-gradient(135deg, ${coverColor} 0%, ${coverAccent}55 100%)` }}>
                            {images[0]?.url && <img src={images[0].url} alt="cover" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />}
                            <div className="relative z-10">
                                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">SECURE DRIVE</p>
                                <p className="text-white text-3xl font-bold">{clientName}</p>
                                <p className="text-white/60 text-sm mt-1">{images.length + videos.length} files</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium mb-2">Background Color</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-muted bg-muted/20">
                                    <input type="color" value={coverColor} onChange={e => setCoverColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                                    <span className="text-xs font-mono text-muted-foreground">{coverColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Accent Color</label>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-muted bg-muted/20">
                                    <input type="color" value={coverAccent} onChange={e => setCoverAccent(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                                    <span className="text-xs font-mono text-muted-foreground">{coverAccent}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-3">Cover Photo</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {images.slice(0, 6).map((img, idx) => (
                                    <button key={idx} className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-foreground transition-all">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                                {images.length === 0 && <p className="text-sm text-muted-foreground col-span-6">No photos yet.</p>}
                            </div>
                        </div>
                        <button className="mt-8 px-6 py-3 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-opacity text-sm">Save Design</button>
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-none { scrollbar-width: none; }
                .scrollbar-none::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
