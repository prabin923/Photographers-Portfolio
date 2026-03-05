"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewDrivePage() {
    const router = useRouter();
    const [clientName, setClientName] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (files.length === 0) {
            setError("Please select at least one photo or video.");
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("wfolio_token");
            const formData = new FormData();
            formData.append("clientName", clientName);

            files.forEach((file) => {
                formData.append("files", file);
            });

            const res = await fetch("http://localhost:4000/api/drives", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData, // the browser sets multipart/form-data headers automatically
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create drive");
            }

            // Success
            router.push("/admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-premium-gradient text-white font-sans overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-xl slide-up">
                <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-white/30 hover:text-white transition-all mb-8 group">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                        </svg>
                    </div>
                    BACK TO DASHBOARD
                </Link>

                <div className="glass-dark border border-white/5 rounded-[2.5rem] p-10 md:p-12 shadow-2xl backdrop-blur-3xl">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black tracking-tight mb-2 text-gradient">Create Masterpiece</h1>
                        <p className="text-white/40 text-sm font-medium">Ignite a new client experience by crafting a secure digital sanctuary for their memories.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl text-xs font-bold mb-8 border border-rose-500/20 animate-fade-in flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 ml-1" htmlFor="clientName">
                                Project Identity
                            </label>
                            <input
                                id="clientName"
                                type="text"
                                required
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-white/20 transition-all placeholder:text-white/10"
                                placeholder="e.g. Cinematic Wedding Sequence 2024"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 ml-1">
                                Media Selection
                            </label>
                            <div className="relative group/drop">
                                <label htmlFor="files" className="flex flex-col items-center justify-center w-full h-56 border-2 border-white/5 border-dashed rounded-[2rem] cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 overflow-hidden relative">
                                    <div className="flex flex-col items-center justify-center py-10 z-10">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover/drop:scale-110 group-hover/drop:bg-blue-500/10 transition-all duration-500">
                                            <svg className="w-8 h-8 text-white/20 group-hover/drop:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-bold text-white/60 group-hover/drop:text-white transition-colors">Import Assets</p>
                                        <p className="text-[10px] text-white/20 mt-2 font-medium italic">High-res photos and 4K videos</p>
                                    </div>
                                    <input
                                        id="files"
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                    />
                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/drop:opacity-100 transition-opacity"></div>
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div className="mt-6 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 animate-fade-in">
                                    <div className="flex items-center justify-between mb-3 border-b border-blue-500/10 pb-3">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{files.length} Assets Staged</p>
                                        <p className="text-[10px] font-bold text-white/20 uppercase">{(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1)} MB</p>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                        {files.slice(0, 5).map((file, i) => (
                                            <div key={i} className="flex justify-between items-center text-[11px]">
                                                <span className="text-white/60 font-medium truncate max-w-[250px]">{file.name}</span>
                                                <span className="text-white/20 font-bold">{(file.size / 1024 / 1024).toFixed(1)}M</span>
                                            </div>
                                        ))}
                                        {files.length > 5 && (
                                            <p className="text-[10px] text-white/20 italic mt-2">... and {files.length - 5} more files</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || files.length === 0}
                            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 disabled:opacity-30 transition-all accent-glow active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    PUBLISHING...
                                </>
                            ) : (
                                <>
                                    GENERATE SECURE LINK
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
