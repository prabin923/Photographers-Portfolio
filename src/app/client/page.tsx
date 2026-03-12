"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Drive {
    id: string;
    clientName: string;
    status: string;
    createdAt: string;
    images: { url: string }[];
}

export default function ClientPortal() {
    const router = useRouter();
    const [drives, setDrives] = useState<Drive[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/drives/public")
            .then((res) => res.json())
            .then((data) => {
                setDrives(data.drives || []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-premium-gradient text-white font-sans overflow-y-auto custom-scrollbar flex flex-col p-10">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-20 slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6 mx-auto shadow-xl">
                        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                        Exclusive Access Portal
                    </div>
                    <h1 className="text-6xl font-black mb-6 tracking-tighter text-gradient">Your Visual Sanctuary</h1>
                    <p className="text-white/30 max-w-xl mx-auto text-sm font-medium leading-relaxed tracking-wide">
                        Enter your private collection to rediscover moments captured with precision and artistic soul.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="w-12 h-12 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sequencing your collections...</p>
                    </div>
                ) : drives.length === 0 ? (
                    <div className="glass-dark border border-white/5 rounded-[3rem] py-32 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <p className="text-4xl">📷</p>
                        </div>
                        <h3 className="text-xl font-bold mb-3">No collections found yet</h3>
                        <p className="text-white/30 text-xs font-medium max-w-xs mx-auto mb-0 leading-relaxed">Your photographer will invite you here once your masterpieces are ready for viewing.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {drives.map((drive, i) => (
                            <button
                                key={drive.id}
                                onClick={() => router.push(`/client/${drive.id}`)}
                                className="group text-left glass-dark border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all duration-700 slide-up relative"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                {/* Thumbnail */}
                                <div className="relative w-full aspect-[4/5] bg-white/[0.02] overflow-hidden">
                                    {drive.images?.[0]?.url ? (
                                        <img
                                            src={drive.images[0].url}
                                            alt={drive.clientName}
                                            className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-[1.5s] ease-out opacity-80 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

                                    {/* Badge */}
                                    <div className="absolute top-6 left-6">
                                        <span className="px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60">
                                            {drive.id.substring(0, 8)}
                                        </span>
                                    </div>

                                    {/* Action Hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100">
                                        <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl accent-glow">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-8 relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-2xl font-black tracking-tighter group-hover:text-blue-400 transition-colors">{drive.clientName}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${drive.status === "Active" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-white/20"}`}></span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{drive.status}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                        Captured · {drive.createdAt ? new Date(drive.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recent'} · {drive.images?.length || 0} Assets
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
