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
        <div className="container mx-auto px-6 py-12 flex-1 max-w-2xl">
            <div className="mb-8">
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold mb-2">Create New Client Drive</h1>
                <p className="text-muted-foreground">Upload photos and videos to generate a secure gallery for your client.</p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8 border border-muted slide-up">
                {error && (
                    <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm mb-6 border border-rose-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="clientName">
                            Client or Project Name
                        </label>
                        <input
                            id="clientName"
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground transition-all"
                            placeholder="e.g. Emma & James Wedding"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground" htmlFor="files">
                            Upload Media Files
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="files" className="flex flex-col items-center justify-center w-full h-48 border-2 border-muted border-dashed rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">JPEG, PNG, MP4</p>
                                </div>
                                <input
                                    id="files"
                                    type="file"
                                    className="hidden"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-muted/50">
                                <p className="text-sm font-medium mb-2">{files.length} file(s) selected:</p>
                                <div className="max-h-32 overflow-y-auto pr-2 space-y-1">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex justify-between text-xs text-muted-foreground">
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || files.length === 0}
                        className="w-full py-4 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity mt-4 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading {files.length} File(s)...
                            </>
                        ) : "Generate Secure Gallery Link"}
                    </button>
                </form>
            </div>
        </div>
    );
}
