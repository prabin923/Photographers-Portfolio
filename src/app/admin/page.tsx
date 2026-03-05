"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import React from "react";

interface Drive {
    id: string;
    clientName: string;
    driveFolderId?: string;
    status: string;
    favoritesCount: string;
    createdAt: string;
    expiresAt?: string;
    images?: { url: string }[];
    videos?: { url: string }[];
    views?: number;
    downloads?: number;
    size?: string;
}

export default function AdminDashboard() {
    const [drives, setDrives] = useState<Drive[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Inline upload state
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDrives = useCallback(async () => {
        try {
            const token = localStorage.getItem("wfolio_token");
            const res = await fetch("http://localhost:4000/api/drives", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.drives) setDrives(data.drives);
        } catch (e) {
            console.error("Failed to load drives", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchDrives(); }, [fetchDrives]);

    const handleAddFiles = async (driveId: string) => {
        if (uploadFiles.length === 0) return;
        setIsUploading(true);
        try {
            const token = localStorage.getItem("wfolio_token");
            const formData = new FormData();
            uploadFiles.forEach(f => formData.append("files", f));

            const res = await fetch(`http://localhost:4000/api/drives/${driveId}/upload`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            await fetchDrives();
            setExpandedId(null);
            setUploadFiles([]);
        } catch (e) {
            console.error("Add files error:", e);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this gallery? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem("wfolio_token");
            const res = await fetch(`http://localhost:4000/api/drives/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setDrives(prev => prev.filter(d => d.id !== id));
            } else {
                alert("Failed to delete gallery");
            }
        } catch (e) {
            console.error("Delete error:", e);
        }
    };

    const filteredDrives = drives.filter(d =>
        d.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-premium-gradient text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col glass">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center accent-glow">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-gradient">LensDrive</h2>
                    </div>

                    <nav className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl text-sm font-bold transition-all border border-blue-500/20 shadow-lg shadow-blue-500/5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl text-sm font-semibold transition-all group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Galleries
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl text-sm font-semibold transition-all group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                            </svg>
                            Clients
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl text-sm font-semibold transition-all group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </button>
                    </nav>
                </div>

                {/* Sidebar Usage Info */}
                <div className="mt-auto p-6">
                    <div className="glass-dark rounded-2xl p-5 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Storage</p>
                            <p className="text-[10px] font-bold text-blue-400">Upgrade</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <h4 className="text-sm font-bold">13.6 GB</h4>
                                <p className="text-[11px] text-white/40">of 120 GB</p>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: "11.3%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 glass-dark">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search galleries, clients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-white/20 transition-all placeholder:text-white/20"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3 w-5 h-5 text-white/20 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-black/20"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                            <div className="text-right">
                                <p className="text-sm font-bold">Admin</p>
                                <p className="text-[11px] text-white/40 font-medium">Professional Plan</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold glass">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard View */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="slide-up">
                            <h2 className="text-3xl font-bold tracking-tight mb-1">Welcome back</h2>
                            <p className="text-white/40 font-medium">You have {filteredDrives.length} active galleries today.</p>
                        </div>
                        <div className="flex items-center gap-3 slide-up">
                            <Link href="/admin/new" className="bg-white text-black hover:bg-white/90 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xl shadow-white/5 active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Create Gallery
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 slide-up" style={{ animationDelay: '0.05s' }}>
                        {[
                            { label: 'Total Galleries', value: drives.length, icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', color: 'blue' },
                            { label: 'Media Assets', value: drives.reduce((acc, d) => acc + (d.images?.length || 0) + (d.videos?.length || 0), 0), icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'purple' },
                            { label: 'Total Views', value: drives.reduce((acc, d) => acc + (d.views || 0), 0), icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'emerald' },
                            { label: 'Cloud Storage', value: '11.3%', sub: '13.6 GB / 120 GB', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', color: 'orange' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-dark rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all hover-slide-up group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                        </svg>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(n => <div key={n} className="w-6 h-6 rounded-full border-2 border-black/20 bg-white/5 overflow-hidden"></div>)}
                                    </div>
                                </div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-black">{stat.value}</p>
                                    {stat.sub && <p className="text-[10px] font-bold text-white/20 whitespace-nowrap">{stat.sub}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table Section */}
                    <div className="flex-1 flex flex-col min-h-0 slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden flex-1 flex flex-col shadow-2xl">
                            <div className="overflow-x-auto custom-scrollbar h-full">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-8 py-5 w-12 text-center">
                                                <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                            </th>
                                            <th className="px-4 py-5 w-16 text-[10px] font-bold text-white/30 uppercase tracking-widest text-center" title="Thumbnail">Media</th>
                                            <th className="px-4 py-5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Gallery Info</th>
                                            <th className="px-4 py-5 w-24 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mx-auto text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </th>
                                            <th className="px-4 py-5 w-24 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mx-auto text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </th>
                                            <th className="px-4 py-5 w-20 text-center text-[10px] font-bold text-white/30 uppercase tracking-widest">Type</th>
                                            <th className="px-4 py-5 w-32 text-[10px] font-bold text-white/30 uppercase tracking-widest text-center">Created</th>
                                            <th className="px-4 py-5 w-32 text-[10px] font-bold text-white/30 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-4 py-5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Direct access</th>
                                            <th className="px-8 py-5 w-20"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isLoading ? (
                                            <tr><td colSpan={10} className="py-32 text-center text-white/20 text-sm font-medium italic">Loading your masterpiece galleries...</td></tr>
                                        ) : filteredDrives.length === 0 ? (
                                            <tr><td colSpan={10} className="py-32 text-center text-white/20 text-sm font-medium">Capture some moments to see them here.</td></tr>
                                        ) : filteredDrives.map(drive => (
                                            <React.Fragment key={drive.id}>
                                                <tr className="hover:bg-white/[0.03] transition-all group cursor-default">
                                                    <td className="px-8 py-5 text-center">
                                                        <div className="w-5 h-5 rounded border border-white/10 group-hover:border-white/30 flex items-center justify-center transition-colors"></div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/5 ring-1 ring-white/5 group-hover:ring-blue-500/50 transition-all duration-500">
                                                            {drive.images && drive.images[0] ? (
                                                                <img src={drive.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white/10">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{drive.clientName}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-[11px] text-white/40 font-bold tracking-tight">
                                                                    {(drive.images?.length || 0) + (drive.videos?.length || 0)} FILES
                                                                </p>
                                                                <span className="w-0.5 h-0.5 rounded-full bg-white/20"></span>
                                                                <p className="text-[11px] text-white/40 font-bold tracking-tight uppercase">{drive.size || "Standard"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5 text-center text-xs font-bold text-white/60">{drive.views || 0}</td>
                                                    <td className="px-4 py-5 text-center text-xs font-bold text-white/60">{drive.downloads || 0}</td>
                                                    <td className="px-4 py-5 text-center">
                                                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                                                            Client
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-5 text-center text-[11px] font-bold text-white/40 font-mono italic">{drive.createdAt}</td>
                                                    <td className="px-4 py-5 text-center">
                                                        <div className="inline-flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Active</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className="flex items-center gap-2 group/link">
                                                            <Link href={`/client/${drive.id}`} className="text-xs font-bold text-white/30 hover:text-white truncate max-w-[120px] transition-colors">
                                                                lensdrive.com/cl/{drive.id.slice(-6)}
                                                            </Link>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(`http://localhost:3000/client/${drive.id}`)}
                                                                className="p-1 text-white/20 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 group-hover/link:scale-110"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleDelete(drive.id)}
                                                                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                                                title="Delete Gallery"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => setExpandedId(expandedId === drive.id ? null : drive.id)}
                                                                className={`p-2 rounded-xl transition-all ${expandedId === drive.id ? 'bg-blue-600 text-white accent-glow' : 'bg-white/5 text-white/30 hover:text-white hover:bg-white/10 border border-white/5'}`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-500 ${expandedId === drive.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedId === drive.id && (
                                                    <tr className="bg-blue-600/[0.02]">
                                                        <td colSpan={10} className="px-10 py-10">
                                                            <div className="max-w-xl">
                                                                <div className="flex items-center justify-between mb-6">
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-white">Add magic to {drive.clientName}</h3>
                                                                        <p className="text-xs text-white/40 font-medium">Upload photos or videos directly to this gallery.</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setExpandedId(null)}
                                                                        className="p-2 text-white/20 hover:text-white transition-colors"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                <div
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    className="border-2 border-dashed border-white/10 rounded-3xl py-12 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/[0.02] transition-all duration-500 group/drop"
                                                                >
                                                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover/drop:scale-110 group-hover/drop:bg-blue-500/10 transition-all duration-500">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white/20 group-hover/drop:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                                        </svg>
                                                                    </div>
                                                                    <p className="text-sm font-bold text-white/60 group-hover/drop:text-white transition-colors">Select your media assets</p>
                                                                    <p className="text-[11px] text-white/20 mt-1 font-medium italic">Photos and cinematic videos supported</p>
                                                                    <input
                                                                        ref={fileInputRef}
                                                                        type="file" multiple accept="image/*,video/*" className="hidden"
                                                                        onChange={(e) => setUploadFiles(e.target.files ? Array.from(e.target.files) : [])}
                                                                    />
                                                                </div>
                                                                {uploadFiles.length > 0 && (
                                                                    <div className="mt-6 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl animate-fade-in shadow-lg shadow-blue-500/10">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-black">
                                                                                {uploadFiles.length}
                                                                            </div>
                                                                            <span className="text-sm font-bold text-blue-100">Assets ready for transfer</span>
                                                                        </div>
                                                                        <div className="flex gap-4">
                                                                            <button onClick={() => setUploadFiles([])} className="text-xs font-bold text-white/40 hover:text-white transition-colors">Abort</button>
                                                                            <button
                                                                                onClick={() => handleAddFiles(drive.id)}
                                                                                disabled={isUploading}
                                                                                className="bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 active:scale-95"
                                                                            >
                                                                                {isUploading ? "TRANSFERRING..." : "START UPLOAD"}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Section */}
                            <div className="h-16 border-t border-white/5 px-10 bg-black/40 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">
                                    Total of {drives.length} curated galleries
                                </p>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/20 cursor-not-allowed transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xs accent-glow transition-all active:scale-90">
                                        1
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/20 cursor-not-allowed transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
