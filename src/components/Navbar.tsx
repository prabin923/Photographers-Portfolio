"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Pages that belong to the photographer's personal website
const PHOTOGRAPHER_PAGES = ["/portfolio", "/contact", "/client"];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);
    const [photographerName, setPhotographerName] = useState("");
    const [accentColor, setAccentColor] = useState("#3b82f6");

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem("wfolio_user");
            if (storedUser) {
                try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
            } else {
                setUser(null);
            }
        };
        checkUser();
        window.addEventListener("auth-change", checkUser);
        return () => window.removeEventListener("auth-change", checkUser);
    }, []);

    // Fetch photographer settings for photographer pages
    useEffect(() => {
        const isPhotographerPage = PHOTOGRAPHER_PAGES.some(p => pathname.startsWith(p));
        if (isPhotographerPage) {
            fetch("http://localhost:4000/api/site")
                .then(res => res.json())
                .then(data => {
                    if (data.photographerName) setPhotographerName(data.photographerName);
                    if (data.accentColor) setAccentColor(data.accentColor);
                })
                .catch(() => { });
        }
    }, [pathname]);

    // Hide on home page & admin
    if (pathname.startsWith("/admin") || pathname === "/") return null;

    const handleLogout = () => {
        localStorage.removeItem("wfolio_token");
        localStorage.removeItem("wfolio_user");
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
    };

    const isPhotographerPage = PHOTOGRAPHER_PAGES.some(p => pathname.startsWith(p));

    // ── PHOTOGRAPHER'S PERSONAL NAVBAR ──
    if (isPhotographerPage) {
        return (
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Photographer brand name */}
                    <Link href="/portfolio" className="text-xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
                        {photographerName || "Studio"}
                    </Link>

                    {/* Photographer navigation */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/portfolio"
                            className={`transition-colors ${pathname === "/portfolio" ? "text-white" : "text-white/40 hover:text-white/70"}`}>
                            Portfolio
                        </Link>
                        <Link href="/contact"
                            className={`transition-colors ${pathname === "/contact" ? "text-white" : "text-white/40 hover:text-white/70"}`}>
                            Contact
                        </Link>
                        <Link href="/client"
                            className={`transition-colors ${pathname.startsWith("/client") ? "text-white" : "text-white/40 hover:text-white/70"}`}>
                            Client Gallery
                        </Link>
                    </nav>

                    {/* Right side: auth + "Powered by" */}
                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <Link href="/admin"
                                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all hidden md:block">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout}
                                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                                    Log Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>
        );
    }

    // ── LENSFOLIO SAAS NAVBAR (About, etc.) ──
    return (
        <header className="sticky top-0 z-50 w-full border-b border-muted/20 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="text-xl font-black tracking-tighter text-gradient">
                    LensFolio
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/about" className="hover:text-muted-foreground transition-colors">About</Link>
                </nav>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link href="/admin"
                                className="text-sm font-medium px-4 py-2 hover:bg-muted rounded-full transition-colors hidden md:block">
                                Dashboard
                            </Link>
                            <button onClick={handleLogout}
                                className="text-sm font-medium px-5 py-2.5 rounded-full border border-muted hover:bg-muted transition-colors">
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login"
                                className="text-sm font-medium hidden md:block hover:text-muted-foreground transition-colors">
                                Log in
                            </Link>
                            <Link href="/signup"
                                className="text-sm font-medium px-5 py-2.5 rounded-full bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
