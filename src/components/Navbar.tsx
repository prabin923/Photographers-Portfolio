"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const PHOTOGRAPHER_PAGES = ["/portfolio", "/contact", "/client"];

interface SavedAccount {
    id: string;
    name: string;
    email: string;
    token: string;
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ id?: string; name: string; email: string } | null>(null);
    const [photographerName, setPhotographerName] = useState("");
    const [accentColor, setAccentColor] = useState("#3b82f6");
    const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
    const [showSwitcher, setShowSwitcher] = useState(false);
    const switcherRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem("wfolio_user");
            if (storedUser) {
                try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
            } else {
                setUser(null);
            }
            // Load saved accounts
            const raw = localStorage.getItem("wfolio_saved_accounts");
            if (raw) {
                try { setSavedAccounts(JSON.parse(raw)); } catch { setSavedAccounts([]); }
            }
        };
        checkUser();
        window.addEventListener("auth-change", checkUser);
        return () => window.removeEventListener("auth-change", checkUser);
    }, []);

    // Close switcher when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
                setShowSwitcher(false);
            }
        };
        if (showSwitcher) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSwitcher]);

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

    if (pathname.startsWith("/admin") || pathname === "/") return null;

    const handleLogout = () => {
        localStorage.removeItem("wfolio_token");
        localStorage.removeItem("wfolio_user");
        window.dispatchEvent(new Event("auth-change"));
        setShowSwitcher(false);
        router.push("/");
    };

    const handleSwitchAccount = (account: SavedAccount) => {
        localStorage.setItem("wfolio_token", account.token);
        localStorage.setItem("wfolio_user", JSON.stringify({ id: account.id, name: account.name, email: account.email }));
        window.dispatchEvent(new Event("auth-change"));
        setShowSwitcher(false);
        window.location.reload(); // Full reload to re-fetch all data for the new user
    };

    const handleRemoveSavedAccount = (accountId: string) => {
        const updated = savedAccounts.filter(a => a.id !== accountId);
        setSavedAccounts(updated);
        localStorage.setItem("wfolio_saved_accounts", JSON.stringify(updated));
        // If removing the currently active account, log out
        if (user?.id === accountId) {
            handleLogout();
        }
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    };

    const isPhotographerPage = PHOTOGRAPHER_PAGES.some(p => pathname.startsWith(p));

    // ── PHOTOGRAPHER'S PERSONAL NAVBAR ──
    if (isPhotographerPage) {
        return (
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/portfolio" className="text-xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
                        {photographerName || "Studio"}
                    </Link>

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

                    <div className="flex items-center gap-3">
                        {user && (
                            <>
                                <Link href="/admin"
                                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all hidden md:block">
                                    Dashboard
                                </Link>

                                {/* Account Switcher */}
                                <div className="relative" ref={switcherRef}>
                                    <button
                                        onClick={() => setShowSwitcher(!showSwitcher)}
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 hover:scale-110"
                                        style={{
                                            background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                                            borderColor: showSwitcher ? accentColor : "rgba(255,255,255,0.15)",
                                            color: "white",
                                        }}
                                        title={user.name}>
                                        {getInitials(user.name)}
                                    </button>

                                    {showSwitcher && (
                                        <div className="absolute right-0 top-12 w-72 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200]"
                                            style={{ animation: "switcherIn 0.2s ease-out" }}>

                                            {/* Current account */}
                                            <div className="px-4 pt-4 pb-3 border-b border-white/5">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-3">Current Account</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`, color: "white" }}>
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                                        <p className="text-[11px] text-white/30 truncate">{user.email}</p>
                                                    </div>
                                                    <div className="ml-auto shrink-0">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Other saved accounts */}
                                            {savedAccounts.filter(a => a.id !== user.id).length > 0 && (
                                                <div className="px-4 pt-3 pb-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-2">Switch To</p>
                                                    <div className="space-y-1">
                                                        {savedAccounts.filter(a => a.id !== user.id).map(account => (
                                                            <div key={account.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                                                                onClick={() => handleSwitchAccount(account)}>
                                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 shrink-0">
                                                                    {getInitials(account.name)}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-semibold text-white/70 group-hover:text-white truncate transition-colors">{account.name}</p>
                                                                    <p className="text-[10px] text-white/20 truncate">{account.email}</p>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleRemoveSavedAccount(account.id); }}
                                                                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all p-1"
                                                                    title="Remove saved account">
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
                                                <Link href="/login"
                                                    onClick={() => setShowSwitcher(false)}
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
                            </>
                        )}
                    </div>
                </div>

                <style>{`
                    @keyframes switcherIn {
                        from { opacity: 0; transform: translateY(-8px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
            </header>
        );
    }

    // ── LENSFOLIO SAAS NAVBAR ──
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
