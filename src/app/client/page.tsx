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
        fetch("http://localhost:4000/api/drives")
            .then((res) => res.json())
            .then((data) => {
                setDrives(data.drives || []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    return (
        <div className="container mx-auto px-6 py-16 flex-1">
            <div className="text-center mb-12 slide-up">
                <h1 className="text-4xl font-bold mb-3">Client Galleries</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Select your gallery below to access your private collection of photos and videos.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-muted-foreground animate-pulse">Loading galleries...</div>
            ) : drives.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-5xl mb-4">📷</p>
                    <p className="text-lg font-medium mb-2">No galleries yet</p>
                    <p className="text-sm">Ask your photographer to create a gallery for you.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drives.map((drive, i) => (
                        <button
                            key={drive.id}
                            onClick={() => router.push(`/client/${drive.id}`)}
                            className="group text-left bg-muted/30 border border-muted rounded-2xl overflow-hidden hover:border-foreground/30 hover:shadow-lg transition-all duration-300 slide-up"
                            style={{ animationDelay: `${i * 0.07}s` }}
                        >
                            {/* Thumbnail */}
                            <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
                                {drive.images?.[0]?.url ? (
                                    <img
                                        src={drive.images[0].url}
                                        alt={drive.clientName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Info */}
                            <div className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-foreground text-base">{drive.clientName}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{drive.createdAt} · {drive.images?.length || 0} photos</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${drive.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                                    {drive.status}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
