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

    const filteredDrives = drives.filter(d =>
        d.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col bg-[#fafafa]">
            {/* Top Navigation / Breadcrumb */}
            <div className="border-b bg-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Cloud Drive</h1>
                        <p className="text-xs text-gray-500 font-medium">Manage galleries</p>
                    </div>
                </div>

                {/* Storage Progress */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Storage Usage</p>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: "11.3%" }}></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">13.6 GB / 120 GB</span>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 flex-1 flex flex-col gap-6">

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-gray-200">
                    <button className="px-4 py-2 text-sm font-semibold text-gray-900 border-b-2 border-blue-500 flex items-center gap-2 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        Galleries
                    </button>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link href="/admin/new" className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add gallery
                        </Link>
                        <p className="text-sm text-gray-500 font-medium hidden lg:block">Create client galleries for sharing photos and videos.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded" /></th>
                                    <th className="px-4 py-4 w-16"></th> {/* Thumbnail */}
                                    <th className="px-4 py-4 font-bold text-[13px] text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-4 w-28 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </th>
                                    <th className="px-4 py-4 w-28 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </th>
                                    <th className="px-4 py-4 w-28 text-center font-bold text-[13px] text-gray-500 uppercase tracking-wider text-center">Type</th>
                                    <th className="px-4 py-4 w-32 font-bold text-[13px] text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-4 py-4 w-32 font-bold text-[13px] text-gray-500 uppercase tracking-wider">Expires</th>
                                    <th className="px-4 py-4 font-bold text-[13px] text-gray-500 uppercase tracking-wider">Gallery link</th>
                                    <th className="px-4 py-4 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={10} className="py-20 text-center text-gray-400 font-medium">Loading your galleries...</td></tr>
                                ) : filteredDrives.length === 0 ? (
                                    <tr><td colSpan={10} className="py-20 text-center text-gray-400 font-medium">No galleries found.</td></tr>
                                ) : filteredDrives.map(drive => (
                                    <React.Fragment key={drive.id}>
                                        <tr className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4"><input type="checkbox" className="rounded" /></td>
                                            <td className="px-4 py-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                    {drive.images && drive.images[0] ? (
                                                        <img src={drive.images[0].url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{drive.clientName}</p>
                                                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                                        {(drive.images?.length || 0) + (drive.videos?.length || 0)} files ({drive.size || "Local"})
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm font-semibold text-gray-600">{drive.views || 0}</td>
                                            <td className="px-4 py-4 text-center text-sm font-semibold text-gray-600">{drive.downloads || 0}</td>
                                            <td className="px-4 py-4 text-center text-sm">
                                                <button className="text-gray-300 hover:text-red-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-gray-600 font-mono">{drive.createdAt}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-gray-600 font-mono">{drive.expiresAt || "Never"}</td>
                                            <td className="px-4 py-4">
                                                <Link href={`/client/${drive.id}`} className="text-sm font-bold text-blue-500 hover:text-blue-600 truncate max-w-[150px] inline-block">
                                                    /{drive.clientName.toLowerCase().replace(/\s+/g, '-')}...
                                                </Link>
                                                <button onClick={() => navigator.clipboard.writeText(`http://localhost:3000/client/${drive.id}`)} className="ml-2 text-gray-400 hover:text-gray-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setExpandedId(expandedId === drive.id ? null : drive.id)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === drive.id && (
                                            <tr className="bg-blue-50/30">
                                                <td colSpan={10} className="px-6 py-6">
                                                    <div className="max-w-2xl mx-auto">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="text-sm font-bold text-gray-800">Quick Upload to {drive.clientName}</h3>
                                                            <button
                                                                onClick={() => setExpandedId(null)}
                                                                className="text-gray-400 hover:text-gray-600"
                                                            >✕</button>
                                                        </div>
                                                        <div
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="border-2 border-dashed border-gray-300 rounded-xl py-8 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all group"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300 group-hover:text-blue-400 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                            </svg>
                                                            <p className="text-sm font-semibold text-gray-600">Click to select or drag and drop files</p>
                                                            <p className="text-xs text-gray-400 mt-1">Photos and videos supported</p>
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file" multiple accept="image/*,video/*" className="hidden"
                                                                onChange={(e) => setUploadFiles(e.target.files ? Array.from(e.target.files) : [])}
                                                            />
                                                        </div>
                                                        {uploadFiles.length > 0 && (
                                                            <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                                                <span className="text-sm font-bold text-blue-600">{uploadFiles.length} files selected</span>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => setUploadFiles([])} className="px-3 py-1.5 text-xs font-bold text-gray-500">Clear</button>
                                                                    <button
                                                                        onClick={() => handleAddFiles(drive.id)}
                                                                        disabled={isUploading}
                                                                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                                                                    >
                                                                        {isUploading ? "Uploading..." : "Upload All"}
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

                    {/* Bottom Status / Pagination Placeholder */}
                    <div className="border-t border-gray-100 px-8 py-4 bg-gray-50/50 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Showing {filteredDrives.length} of {drives.length} galleries
                        </p>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-400 cursor-not-allowed">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-300 text-gray-800 font-bold text-xs ring-2 ring-blue-500/20 shadow-sm transition-all">
                                1
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-400 cursor-not-allowed">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
