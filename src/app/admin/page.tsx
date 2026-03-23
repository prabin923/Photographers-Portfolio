"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import React from "react";

interface Drive {
    id: string;
    clientName: string;
    status: string;
    favoritesCount: string;
    createdAt: string;
    images?: { url: string }[];
    videos?: { url: string }[];
    views?: number;
    size?: string;
}

interface SiteSettings {
    theme: string;
    accentColor: string;
    photographerName: string;
    tagline: string;
    bio: string;
    email: string;
    phone: string;
    location: string;
    portfolioPhotos: { id: string; url: string; title: string }[];
    instagramUrl: string;
    twitterUrl: string;
    pinterestUrl: string;
}

const defaultSite: SiteSettings = {
    theme: "dark", accentColor: "#3b82f6", photographerName: "", tagline: "", bio: "",
    email: "", phone: "", location: "", portfolioPhotos: [], instagramUrl: "#", twitterUrl: "#", pinterestUrl: "#"
};

const themes = [
    { id: "dark", label: "Dark Mode", desc: "Sleek obsidian & blue", preview: "from-zinc-950 via-zinc-900 to-zinc-950", accent: "#3b82f6" },
    { id: "midnight", label: "Midnight", desc: "Deep navy & indigo", preview: "from-slate-950 via-indigo-950 to-slate-950", accent: "#6366f1" },
    { id: "elegant", label: "Elegant", desc: "Dark rose & plum", preview: "from-zinc-950 via-rose-950 to-zinc-950", accent: "#e11d48" },
];

const NAV_SECTIONS = [
    { id: "identity", label: "Identity", icon: "✦", desc: "Name, bio & tagline" },
    { id: "portfolio", label: "Portfolio", icon: "◈", desc: "Upload & manage photos" },
    { id: "appearance", label: "Appearance", icon: "◉", desc: "Theme & color scheme" },
    { id: "contact", label: "Contact", icon: "⊕", desc: "Email, phone & socials" },
];

interface SavedAccount { id: string; name: string; email: string; token: string; }

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<"dashboard" | "website" | "ai-detector">("dashboard");
    const [drives, setDrives] = useState<Drive[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Detector State
    const [aiFileBase64, setAiFileBase64] = useState<string | null>(null);
    const [aiFileObj, setAiFileObj] = useState<File | null>(null);
    const [isCheckingAi, setIsCheckingAi] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);

    // Website Builder
    const [site, setSite] = useState<SiteSettings>(defaultSite);
    const [activeSection, setActiveSection] = useState("identity");
    const [newPortfolioFiles, setNewPortfolioFiles] = useState<File[]>([]);
    const [isSavingSite, setIsSavingSite] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [isPublished, setIsPublished] = useState(false);
    const [previewPage, setPreviewPage] = useState<"portfolio" | "about" | "contact">("portfolio");
    const [iframeKey, setIframeKey] = useState(0);
    const portfolioFileRef = useRef<HTMLInputElement>(null);

    // Account Switcher
    const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; email: string } | null>(null);
    const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
    const [showSwitcher, setShowSwitcher] = useState(false);
    const switcherRef = useRef<HTMLDivElement>(null);

    // Plan & Storage
    const [planInfo, setPlanInfo] = useState<{ plan: { id: string; name: string; storageLimitGB: number; maxGalleries: number; price: number; period: string }; storage: { usedGB: number; limitGB: number; percentUsed: number }; galleries: { count: number; limit: number } } | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const fetchPlanInfo = useCallback(async () => {
        try {
            const token = localStorage.getItem("wfolio_token");
            const res = await fetch("/api/plan", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            setPlanInfo(data);
        } catch (e) { console.error("Failed to load plan", e); }
    }, []);

    const fetchDrives = useCallback(async () => {
        try {
            const token = localStorage.getItem("wfolio_token");
            const res = await fetch("/api/drives", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (data.drives) setDrives(data.drives);
        } catch (e) { console.error("Failed to load drives", e); }
        finally { setIsLoading(false); }
    }, []);

    const fetchSiteSettings = useCallback(async () => {
        try {
            const token = localStorage.getItem("wfolio_token");
            const res = await fetch("/api/site", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            setSite({ ...defaultSite, ...data });
            setIsPublished(true);
        } catch (e) { console.error("Failed to load site settings", e); }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("wfolio_token");
        if (!token) {
            router.replace("/login");
        } else {
            setIsAuthenticated(true);
            fetchDrives();
            fetchSiteSettings();
            fetchPlanInfo();
        }
        // Load current user + saved accounts
        const storedUser = localStorage.getItem("wfolio_user");
        if (storedUser) { try { setCurrentUser(JSON.parse(storedUser)); } catch { } }
        const raw = localStorage.getItem("wfolio_saved_accounts");
        if (raw) { try { setSavedAccounts(JSON.parse(raw)); } catch { } }
    }, [router, fetchDrives, fetchSiteSettings]);

    // Close switcher on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) setShowSwitcher(false);
        };
        if (showSwitcher) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSwitcher]);

    // Block render until auth is confirmed
    if (!isAuthenticated) return null;

    const handleAddFiles = async (driveId: string) => {
        if (uploadFiles.length === 0) return;
        setIsUploading(true);
        try {
            const token = localStorage.getItem("wfolio_token");
            const formData = new FormData();
            uploadFiles.forEach(f => formData.append("files", f));
            const res = await fetch(`/api/drives/${driveId}/upload`, { method: "PATCH", headers: { "Authorization": `Bearer ${token}` }, body: formData });
            if (!res.ok) throw new Error("Upload failed");
            await fetchDrives();
            setExpandedId(null);
            setUploadFiles([]);
        } catch (e) { console.error("Add files error:", e); }
        finally { setIsUploading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this gallery? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem("wfolio_token");
            const res = await fetch(`/api/drives/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) setDrives(prev => prev.filter(d => d.id !== id));
        } catch (e) { console.error("Delete error:", e); }
    };

    const handleSaveSite = async () => {
        setIsSavingSite(true);
        setSaveStatus("saving");
        try {
            const formData = new FormData();
            const fields: (keyof SiteSettings)[] = ["theme", "accentColor", "photographerName", "tagline", "bio", "email", "phone", "location", "instagramUrl", "twitterUrl", "pinterestUrl"];
            fields.forEach(f => formData.append(f, site[f] as string));
            formData.append("remainingPhotoIds", JSON.stringify(site.portfolioPhotos.map(p => p.id)));
            newPortfolioFiles.forEach(f => formData.append("newPhotos", f));
            const token = localStorage.getItem("wfolio_token");
            const res = await fetch("/api/site", { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData });
            if (!res.ok) throw new Error("Save failed");
            const data = await res.json();
            setSite({ ...defaultSite, ...data.settings });
            setNewPortfolioFiles([]);
            setSaveStatus("saved");
            setIsPublished(true);
            setIframeKey(k => k + 1);
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (e) {
            console.error("Save site error:", e);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
        finally { setIsSavingSite(false); }
    };

    const filteredDrives = drives.filter(d => d.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    const previewUrls = { portfolio: "http://localhost:3000/portfolio", about: "http://localhost:3000/about", contact: "http://localhost:3000/contact" };

    const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    const handleSwitchAccount = (account: SavedAccount) => {
        localStorage.setItem("wfolio_token", account.token);
        localStorage.setItem("wfolio_user", JSON.stringify({ id: account.id, name: account.name, email: account.email }));
        window.dispatchEvent(new Event("auth-change"));
        setShowSwitcher(false);
        window.location.reload();
    };

    const handleRemoveSavedAccount = (accountId: string) => {
        const updated = savedAccounts.filter(a => a.id !== accountId);
        setSavedAccounts(updated);
        localStorage.setItem("wfolio_saved_accounts", JSON.stringify(updated));
        if (currentUser?.id === accountId) handleLogout();
    };

    const handleLogout = () => {
        localStorage.removeItem("wfolio_token");
        localStorage.removeItem("wfolio_user");
        window.dispatchEvent(new Event("auth-change"));
        setShowSwitcher(false);
        router.push("/login");
    };

    const handleUpgrade = async (planId: string) => {
        setIsUpgrading(true);
        try {
            const token = localStorage.getItem("wfolio_token");
            const res = await fetch("/api/plan/upgrade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ planId })
            });
            if (!res.ok) throw new Error("Failed to upgrade plan");
            await fetchPlanInfo();
            setShowUpgradeModal(false);
        } catch (e) {
            console.error("Upgrade error:", e);
        } finally {
            setIsUpgrading(false);
        }
    };

    const PREVIEW_PAGES = [
        { id: "portfolio" as const, label: "Portfolio" },
        { id: "about" as const, label: "About" },
        { id: "contact" as const, label: "Contact" },
    ];

    return (
        <div className="flex h-screen bg-premium-gradient text-white overflow-hidden font-sans">
            {/* ─── Sidebar ─── */}
            <aside className="w-60 border-r border-white/5 bg-black/30 backdrop-blur-xl flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-black tracking-tight">LensFolio</h2>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Pro Studio</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-1 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 px-3 mb-3">Management</p>
                    {[
                        { id: "dashboard", label: "Dashboard", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
                        { id: "website", label: "Website Builder", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg> },
                        { id: "ai-detector", label: "AI Image Detector", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
                    ].map(item => (
                        <button key={item.id} onClick={() => setSidebarTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${sidebarTab === item.id ? "bg-blue-600/15 text-blue-400 border border-blue-500/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                            {item.icon} {item.label}
                            {item.id === "website" && isPublished && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-3">
                    {/* Plan badge */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${planInfo?.plan.id === 'business' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                planInfo?.plan.id === 'pro' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                                    'bg-white/5 text-white/30 border border-white/5'
                                }`}>{planInfo?.plan.name || 'Free'}</span>
                        </div>
                        <button onClick={() => setShowUpgradeModal(true)} className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors">
                            {planInfo?.plan.id === 'business' ? 'Manage' : 'Upgrade'}
                        </button>
                    </div>

                    {/* Storage bar */}
                    <div className="bg-white/3 rounded-2xl p-4 border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Storage</p>
                            <p className="text-[9px] font-bold text-white/20">{planInfo?.storage.percentUsed || 0}%</p>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full mb-2 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${(planInfo?.storage.percentUsed || 0) > 90 ? 'bg-rose-500' :
                                (planInfo?.storage.percentUsed || 0) > 70 ? 'bg-amber-500' : 'bg-blue-500'
                                }`} style={{ width: `${Math.min(planInfo?.storage.percentUsed || 0, 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] text-white/30">{planInfo?.storage.usedGB || 0} GB of {planInfo?.storage.limitGB || 120} GB</p>
                    </div>

                    {/* Gallery count */}
                    <div className="px-1 flex items-center justify-between">
                        <p className="text-[9px] text-white/20">Galleries</p>
                        <p className="text-[9px] font-bold text-white/30">
                            {planInfo?.galleries.count || 0} / {planInfo?.galleries.limit === -1 ? '∞' : (planInfo?.galleries.limit || '∞')}
                        </p>
                    </div>
                </div>
            </aside>

            {/* ─── Main ─── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-xl flex-shrink-0">
                    {sidebarTab === "dashboard" ? (
                        <div className="relative max-w-sm w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-2.5 w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input type="text" placeholder="Search galleries..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all placeholder:text-white/20" />
                        </div>
                    ) : sidebarTab === "website" ? (
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-sm font-black tracking-tight">Website Builder</h1>
                                <p className="text-[10px] text-white/30">Your public-facing site</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPublished ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/30 border border-white/5"}`}>
                                <span className={`w-1 h-1 rounded-full ${isPublished ? "bg-emerald-400" : "bg-white/30"}`}></span>
                                {isPublished ? "Published" : "Draft"}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-sm font-black tracking-tight">AI Image Detector</h1>
                                <p className="text-[10px] text-white/30">Powered by Gemini</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        {sidebarTab === "website" && (
                            <>
                                <a href="/portfolio" target="_blank" className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    Visit Site
                                </a>
                                <button onClick={handleSaveSite} disabled={isSavingSite}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${saveStatus === "saved" ? "bg-emerald-500 text-white" : saveStatus === "error" ? "bg-rose-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"} disabled:opacity-50`}>
                                    {saveStatus === "saving" ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                                        : saveStatus === "saved" ? <>✓ Published</>
                                            : saveStatus === "error" ? <>✗ Failed</>
                                                : <>Publish Changes</>}
                                </button>
                            </>
                        )}
                        {/* Account Switcher */}
                        <div className="relative" ref={switcherRef}>
                            <button onClick={() => setShowSwitcher(!showSwitcher)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 hover:scale-110"
                                style={{
                                    background: `linear-gradient(135deg, ${site.accentColor || '#3b82f6'}40, ${site.accentColor || '#3b82f6'}20)`,
                                    borderColor: showSwitcher ? (site.accentColor || '#3b82f6') : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                }}
                                title={currentUser?.name || 'Account'}>
                                {currentUser ? getInitials(currentUser.name) : 'A'}
                            </button>

                            {showSwitcher && (
                                <div className="absolute right-0 top-12 w-72 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200]"
                                    style={{ animation: 'adminSwitcherIn 0.2s ease-out' }}>
                                    {/* Current account */}
                                    <div className="px-4 pt-4 pb-3 border-b border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-3">Current Account</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${site.accentColor || '#3b82f6'}, ${site.accentColor || '#3b82f6'}80)`, color: 'white' }}>
                                                {currentUser ? getInitials(currentUser.name) : 'A'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{currentUser?.name || 'User'}</p>
                                                <p className="text-[11px] text-white/30 truncate">{currentUser?.email}</p>
                                            </div>
                                            <div className="ml-auto shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Other saved accounts */}
                                    {savedAccounts.filter(a => a.id !== currentUser?.id).length > 0 && (
                                        <div className="px-4 pt-3 pb-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2">Switch To</p>
                                            <div className="space-y-1">
                                                {savedAccounts.filter(a => a.id !== currentUser?.id).map(account => (
                                                    <div key={account.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                                                        onClick={() => handleSwitchAccount(account)}>
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 shrink-0">
                                                            {getInitials(account.name)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-white/70 group-hover:text-white truncate transition-colors">{account.name}</p>
                                                            <p className="text-[10px] text-white/20 truncate">{account.email}</p>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveSavedAccount(account.id); }}
                                                            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all p-1" title="Remove">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="border-t border-white/5 p-2">
                                        <Link href="/login" onClick={() => setShowSwitcher(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add another account
                                        </Link>
                                        <button onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400/60 hover:text-rose-400 hover:bg-rose-400/5 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <style>{`@keyframes adminSwitcherIn { from { opacity: 0; transform: translateY(-8px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
                </header>

                {/* ═══════════════════════════════════════════════ */}
                {/* DASHBOARD VIEW */}
                {/* ═══════════════════════════════════════════════ */}
                {sidebarTab === "dashboard" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Welcome back</h2>
                                <p className="text-white/30 text-sm mt-1">{filteredDrives.length} active galleries</p>
                            </div>
                            <Link href="/admin/new" className="bg-white text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                New Gallery
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            {[
                                { label: "Galleries", value: drives.length, color: "blue", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
                                { label: "Media Assets", value: drives.reduce((a, d) => a + (d.images?.length || 0) + (d.videos?.length || 0), 0), color: "purple", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
                                { label: "Total Views", value: drives.reduce((a, d) => a + (d.views || 0), 0), color: "emerald", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
                                { label: "Storage", value: `${planInfo?.storage.percentUsed || 0}%`, sub: `${planInfo?.storage.usedGB || 0} / ${planInfo?.storage.limitGB || 120} GB`, color: "orange", icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" },
                            ].map((stat, i) => (
                                <div key={i} className="glass-dark rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
                                    <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 w-fit mb-4`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
                                    <p className="text-xl font-black">{stat.value}</p>
                                    {stat.sub && <p className="text-[10px] text-white/20 mt-0.5">{stat.sub}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Gallery Card Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-black uppercase tracking-widest text-white/30">All Galleries</p>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{drives.length} total</p>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="glass-dark border border-white/5 rounded-2xl overflow-hidden animate-pulse">
                                            <div className="bg-white/5 h-44"></div>
                                            <div className="p-4 space-y-2">
                                                <div className="h-3 bg-white/5 rounded-full w-3/4"></div>
                                                <div className="h-2 bg-white/5 rounded-full w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredDrives.length === 0 ? (
                                <div className="glass-dark border border-white/5 rounded-2xl py-24 flex flex-col items-center gap-4 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl opacity-30">◈</div>
                                    <div>
                                        <p className="text-white/30 font-bold text-sm">No galleries yet</p>
                                        <p className="text-white/15 text-xs mt-1">Create your first gallery to get started</p>
                                    </div>
                                    <Link href="/admin/new" className="mt-2 px-5 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">
                                        + New Gallery
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredDrives.map(drive => {
                                        const mediaCount = (drive.images?.length || 0) + (drive.videos?.length || 0);
                                        const coverImgSrc = drive.images?.[0]?.url;
                                        const coverImg = coverImgSrc ? coverImgSrc.replace("http://localhost:4000", "") : null;
                                        return (
                                            <div key={drive.id}
                                                className="group glass-dark border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-white/10 hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5"
                                                onClick={() => router.push(`/client/${drive.id}`)}>

                                                {/* Cover */}
                                                <div className="relative h-44 bg-white/[0.03] overflow-hidden">
                                                    {coverImg ? (
                                                        <img src={coverImg} alt=""
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-white/5"
                                                            style={{ color: "transparent" }}
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.classList.add('bg-white/5'); }} />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/10">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider">No media yet</p>
                                                        </div>
                                                    )}
                                                    {/* Dark vignette */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

                                                    {/* Hover action bar */}
                                                    <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`http://localhost:3000/client/${drive.id}`); }}
                                                            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/50 hover:text-white border border-white/10 transition-all hover:bg-black/80"
                                                            title="Copy link">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === drive.id ? null : drive.id); }}
                                                            className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${expandedId === drive.id ? "bg-blue-600 border-blue-500 text-white" : "bg-black/60 text-white/50 hover:text-white border-white/10 hover:bg-black/80"}`}
                                                            title="Upload files">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-transform ${expandedId === drive.id ? "rotate-45" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(drive.id); }}
                                                            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-rose-400/70 hover:text-white hover:bg-rose-500 border border-white/10 transition-all"
                                                            title="Delete">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>

                                                    {/* Status */}
                                                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Active</span>
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="p-4">
                                                    <p className="font-black text-sm truncate group-hover:text-blue-400 transition-colors">{drive.clientName}</p>
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        <p className="text-[10px] text-white/25 font-medium">{mediaCount} file{mediaCount !== 1 ? "s" : ""} · {drive.createdAt}</p>
                                                        <span className="text-[9px] font-mono text-white/15">{drive.id.slice(-6)}</span>
                                                    </div>
                                                </div>

                                                {/* Upload panel (expanded) */}
                                                {expandedId === drive.id && (
                                                    <div className="border-t border-white/5 p-4 bg-blue-500/[0.03]" onClick={e => e.stopPropagation()}>
                                                        <div onClick={() => fileInputRef.current?.click()}
                                                            className="border-2 border-dashed border-white/10 rounded-xl py-6 flex flex-col items-center cursor-pointer hover:border-blue-500/40 transition-all group/drop">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/20 group-hover/drop:text-blue-400 transition-colors mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                                            <p className="text-xs font-bold text-white/30">Click to select files</p>
                                                            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => setUploadFiles(e.target.files ? Array.from(e.target.files) : [])} />
                                                        </div>
                                                        {uploadFiles.length > 0 && (
                                                            <div className="mt-3 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl">
                                                                <span className="text-xs font-bold text-blue-300">{uploadFiles.length} file(s) ready</span>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => setUploadFiles([])} className="text-[10px] text-white/30 hover:text-white">Clear</button>
                                                                    <button onClick={() => handleAddFiles(drive.id)} disabled={isUploading} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black hover:bg-blue-500 transition-all disabled:opacity-50">
                                                                        {isUploading ? "Uploading..." : "Upload"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* WEBSITE BUILDER VIEW — SaaS Split-Pane Layout  */}
                {/* ═══════════════════════════════════════════════ */}
                {sidebarTab === "website" && (
                    <div className="flex-1 flex overflow-hidden">
                        {/* ─ Left: Section Navigation + Settings ─ */}
                        <div className="w-[380px] flex-shrink-0 border-r border-white/5 flex flex-col bg-black/20">
                            {/* Section Nav */}
                            <div className="p-4 border-b border-white/5 space-y-1">
                                {NAV_SECTIONS.map(section => (
                                    <button key={section.id} onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${activeSection === section.id ? "bg-white/8 border border-white/8" : "hover:bg-white/4"}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 transition-all ${activeSection === section.id ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-white/30 group-hover:text-white/60"}`}>
                                            {section.icon}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${activeSection === section.id ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>{section.label}</p>
                                            <p className="text-[10px] text-white/20">{section.desc}</p>
                                        </div>
                                        {activeSection === section.id && <div className="ml-auto w-1 h-6 bg-blue-500 rounded-full"></div>}
                                    </button>
                                ))}
                            </div>

                            {/* Settings Panel */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
                                {/* ── IDENTITY ── */}
                                {activeSection === "identity" && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-black text-base mb-0.5">Studio Identity</h3>
                                            <p className="text-[11px] text-white/30">This information appears across your website.</p>
                                        </div>
                                        <Field label="Studio / Photographer Name" value={site.photographerName} placeholder="e.g. Prabin Sharma Photography" onChange={v => setSite(p => ({ ...p, photographerName: v }))} />
                                        <Field label="Tagline" value={site.tagline} placeholder="e.g. Capturing timeless moments." onChange={v => setSite(p => ({ ...p, tagline: v }))} />
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Bio / About</label>
                                            <textarea value={site.bio} onChange={e => setSite(p => ({ ...p, bio: e.target.value }))} rows={5} placeholder="Tell your story in a few sentences..." className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium resize-none placeholder:text-white/15" />
                                        </div>
                                    </div>
                                )}

                                {/* ── PORTFOLIO ── */}
                                {activeSection === "portfolio" && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-black text-base mb-0.5">Portfolio Photos</h3>
                                            <p className="text-[11px] text-white/30">Upload photos that appear on your public /portfolio page.</p>
                                        </div>
                                        <div onClick={() => portfolioFileRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-2xl py-10 flex flex-col items-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/3 transition-all group/drop">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover/drop:bg-blue-500/10 transition-all group-hover/drop:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white/20 group-hover/drop:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                            </div>
                                            <p className="text-sm font-bold text-white/40 group-hover/drop:text-white transition-colors">Click to upload photos</p>
                                            <p className="text-[10px] text-white/20 mt-1">JPG, PNG, WEBP</p>
                                            <input ref={portfolioFileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setNewPortfolioFiles(Array.from(e.target.files || []))} />
                                        </div>

                                        {newPortfolioFiles.length > 0 && (
                                            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                                                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-xs font-black text-white">{newPortfolioFiles.length}</div>
                                                <span className="text-xs font-bold text-blue-200 flex-1">Queued — save to publish</span>
                                                <button onClick={() => setNewPortfolioFiles([])} className="text-[10px] text-white/30 hover:text-white">✕</button>
                                            </div>
                                        )}

                                        {site.portfolioPhotos.length > 0 ? (
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">Current Photos ({site.portfolioPhotos.length})</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {site.portfolioPhotos.map(photo => (
                                                        <div key={photo.id} className="relative group/p aspect-square rounded-xl overflow-hidden border border-white/5">
                                                            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                                                            <button onClick={() => setSite(p => ({ ...p, portfolioPhotos: p.portfolioPhotos.filter(x => x.id !== photo.id) }))}
                                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500 text-white text-xs opacity-0 group-hover/p:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-400">×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-xs text-white/20">No photos yet. Upload some above.</p>
                                                <p className="text-[10px] text-white/10 mt-1">The site will show sample photos until you upload your own.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── APPEARANCE ── */}
                                {activeSection === "appearance" && (
                                    <div className="space-y-5">
                                        <div>
                                            <h3 className="font-black text-base mb-0.5">Theme & Appearance</h3>
                                            <p className="text-[11px] text-white/30">Choose the visual identity of your website.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Color Theme</label>
                                            <div className="space-y-2">
                                                {themes.map(t => (
                                                    <button key={t.id} onClick={() => setSite(p => ({ ...p, theme: t.id }))}
                                                        className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${site.theme === t.id ? "border-blue-500/50 bg-blue-500/8" : "border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10"}`}>
                                                        <div className={`w-12 h-10 rounded-lg bg-gradient-to-br ${t.preview} flex-shrink-0 border border-white/10`}>
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <div className="w-4 h-1 rounded-full" style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}60` }}></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold">{t.label}</p>
                                                            <p className="text-[10px] text-white/30">{t.desc}</p>
                                                        </div>
                                                        {site.theme === t.id && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">✓</div>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Accent Color</label>
                                            <div className="flex items-center gap-3 p-3 bg-white/4 rounded-xl border border-white/5">
                                                <input type="color" value={site.accentColor} onChange={e => setSite(p => ({ ...p, accentColor: e.target.value }))} className="w-9 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0.5" />
                                                <span className="font-mono text-sm text-white/50 flex-1">{site.accentColor}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {["#3b82f6", "#6366f1", "#8b5cf6", "#e11d48", "#f59e0b", "#10b981", "#ffffff"].map(c => (
                                                    <button key={c} onClick={() => setSite(p => ({ ...p, accentColor: c }))}
                                                        className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${site.accentColor === c ? "border-white scale-110" : "border-transparent"}`}
                                                        style={{ background: c }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── CONTACT ── */}
                                {activeSection === "contact" && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-black text-base mb-0.5">Contact Information</h3>
                                            <p className="text-[11px] text-white/30">Shown on your Contact page and used by clients.</p>
                                        </div>
                                        <Field label="Email Address" value={site.email} placeholder="hello@yourstudio.com" onChange={v => setSite(p => ({ ...p, email: v }))} type="email" />
                                        <Field label="Phone Number" value={site.phone} placeholder="+977 9864 xxxxxx" onChange={v => setSite(p => ({ ...p, phone: v }))} />
                                        <Field label="Studio Location" value={site.location} placeholder="Kathmandu, Nepal" onChange={v => setSite(p => ({ ...p, location: v }))} />
                                        <div className="pt-2 border-t border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Social Links</p>
                                            <div className="space-y-3">
                                                <Field label="Instagram" value={site.instagramUrl} placeholder="https://instagram.com/yourstudio" onChange={v => setSite(p => ({ ...p, instagramUrl: v }))} />
                                                <Field label="Twitter / X" value={site.twitterUrl} placeholder="https://twitter.com/yourstudio" onChange={v => setSite(p => ({ ...p, twitterUrl: v }))} />
                                                <Field label="Pinterest" value={site.pinterestUrl} placeholder="https://pinterest.com/yourstudio" onChange={v => setSite(p => ({ ...p, pinterestUrl: v }))} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─ Right: Live Preview ─ */}
                        <div className="flex-1 flex flex-col bg-black/40 overflow-hidden">
                            {/* Preview Toolbar */}
                            <div className="h-12 flex items-center gap-3 px-5 border-b border-white/5 bg-black/20 flex-shrink-0">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                                </div>
                                <div className="flex-1 flex items-center gap-2 mx-4 bg-white/5 rounded-lg px-3 h-7 border border-white/5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                                    <span className="text-[11px] font-mono text-white/30 truncate">localhost:3000/{previewPage}</span>
                                </div>
                                <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
                                    {PREVIEW_PAGES.map(p => (
                                        <button key={p.id} onClick={() => setPreviewPage(p.id)}
                                            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${previewPage === p.id ? "bg-white text-black" : "text-white/30 hover:text-white"}`}>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                                <a href={previewUrls[previewPage]} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/30 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </div>
                            {/* Preview iframe */}
                            <div className="flex-1 overflow-hidden">
                                <iframe
                                    key={`${iframeKey}-${previewPage}`}
                                    src={previewUrls[previewPage]}
                                    className="w-full h-full border-0"
                                    style={{ colorScheme: "normal" }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* AI DETECTOR VIEW */}
                {/* ═══════════════════════════════════════════════ */}
                {sidebarTab === "ai-detector" && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <span className="text-blue-400">✦</span> AI Image Detector
                                </h2>
                                <p className="text-white/30 text-sm mt-1">Upload an image to securely detect whether it contains signs of being AI generated, using our deep scanning analysis model.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Upload Box */}
                                <div className="glass-dark border border-white/5 rounded-3xl p-6">
                                    <div 
                                        className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group min-h-[300px]"
                                        onClick={() => document.getElementById('ai-file-upload')?.click()}
                                    >
                                        <input 
                                            id="ai-file-upload" 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    const result = ev.target?.result as string;
                                                    const base64Str = result.split(',')[1];
                                                    setAiFileBase64(base64Str);
                                                    setAiFileObj(file);
                                                    setAiResult(null);
                                                };
                                                reader.readAsDataURL(file);
                                            }} 
                                        />
                                        {aiFileObj ? (
                                            <div className="w-full text-center">
                                                <img src={URL.createObjectURL(aiFileObj)} alt="preview" className="max-h-48 mx-auto rounded-xl object-contain shadow-lg mb-4 cursor-pointer" />
                                                <p className="text-sm font-bold text-white/50">{aiFileObj.name}</p>
                                                <p className="text-[10px] text-white/30 mt-1">Click to change image</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/10 transition-colors group-hover:scale-110">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white/20 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <p className="text-base font-bold text-white/50 group-hover:text-white transition-colors">Select an image</p>
                                                <p className="text-xs text-white/20 mt-2">JPEG, PNG, WEBP supported</p>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={async () => {
                                            if (!aiFileBase64 || !aiFileObj) return;
                                            setIsCheckingAi(true);
                                            try {
                                                const key = "AIzaSyAy82P4IllYzFYoSUbw59evlZa73BXNEiw";
                                                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        contents: [{
                                                            parts: [
                                                                { text: "Analyze this image and determine if it appears to be AI generated. Output a clear conclusion at the beginning (ex: 'Likely AI Generated' or 'Likely Human Photography'), then provide a confidence level, and your detailed reasoning looking closely at characteristics typical to AI generation (textures, realism, symmetry, anomalous limbs/eyes/backgrounds)." },
                                                                { inline_data: { mime_type: aiFileObj.type || "image/jpeg", data: aiFileBase64 } }
                                                            ]
                                                        }]
                                                    })
                                                });
                                                const data = await res.json();
                                                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to retrieve analysis.";
                                                setAiResult(text);
                                            } catch (err) {
                                                console.error(err);
                                                setAiResult("An error occurred during analysis.");
                                            } finally {
                                                setIsCheckingAi(false);
                                            }
                                        }}
                                        disabled={!aiFileBase64 || isCheckingAi}
                                        className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
                                    >
                                        {isCheckingAi ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Scanning...</>
                                        ) : (
                                            <>Run AI Detection</>
                                        )}
                                    </button>
                                </div>

                                {/* Results Box */}
                                <div className="glass-dark border border-white/5 rounded-3xl p-6 flex flex-col">
                                    <h3 className="font-black text-sm uppercase tracking-widest text-white/30 mb-4 border-b border-white/5 pb-4">Detection Results</h3>
                                    
                                    <div className="flex-1 rounded-2xl bg-black/20 border border-white/5 p-5 overflow-y-auto custom-scrollbar">
                                        {!aiFileObj ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                                <p className="text-sm font-bold">No image loaded</p>
                                                <p className="text-[10px] mt-1">Upload an image and run the detection</p>
                                            </div>
                                        ) : isCheckingAi ? (
                                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                                <p className="text-xs font-bold text-white/50 tracking-widest uppercase animate-pulse">Deep Scanning Image...</p>
                                            </div>
                                        ) : aiResult ? (
                                            <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                {aiResult}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                                <p className="text-sm font-bold">Ready to analyze</p>
                                                <p className="text-[10px] mt-1">Click the button to scan</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentPlanId={planInfo?.plan.id || 'free'}
                onUpgrade={handleUpgrade}
                isUpgrading={isUpgrading}
            />
        </div>
    );
}

function UpgradeModal({ isOpen, onClose, currentPlanId, onUpgrade, isUpgrading }: { isOpen: boolean; onClose: () => void; currentPlanId: string; onUpgrade: (id: string) => void; isUpgrading: boolean }) {
    if (!isOpen) return null;

    const plans = [
        { id: 'free', name: 'Starter', price: '$0', storage: '120 GB', galleries: 'Unlimited', color: 'gray' },
        { id: 'pro', name: 'Pro', price: '$12', storage: '500 GB', galleries: 'Unlimited', color: 'blue' },
        { id: 'business', name: 'Business', price: '$29', storage: '2 TB', galleries: 'Unlimited', color: 'amber' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Expand your potential</h2>
                        <p className="text-white/30 text-sm mt-1">Choose a plan that fits your growth</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((p) => (
                        <div key={p.id} className={`p-6 rounded-2xl border transition-all ${currentPlanId === p.id ? 'bg-white/5 border-blue-500/50' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{p.name}</h3>
                                    <p className="text-2xl font-black mt-1">{p.price}<span className="text-xs font-medium text-white/20 ml-1">/mo</span></p>
                                </div>
                                {currentPlanId === p.id && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500 text-white leading-none">Current</span>}
                            </div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm text-white/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {p.storage} Storage
                                </li>
                                <li className="flex items-center gap-2 text-sm text-white/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {p.galleries}
                                </li>
                            </ul>
                            <button
                                onClick={() => onUpgrade(p.id)}
                                disabled={currentPlanId === p.id || isUpgrading}
                                className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentPlanId === p.id ? 'bg-white/5 text-white/30 cursor-default' : p.id === 'pro' ? 'bg-blue-600 hover:bg-blue-500 text-white' : p.id === 'business' ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                                {isUpgrading ? 'Upgrading...' : currentPlanId === p.id ? 'Active Plan' : `Switch to ${p.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helper Field component
function Field({ label, value, placeholder, onChange, type = "text" }: { label: string; value: string; placeholder: string; onChange: (v: string) => void; type?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder:text-white/15" />
        </div>
    );
}
