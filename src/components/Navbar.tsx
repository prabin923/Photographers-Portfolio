"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);

    useEffect(() => {
        // Check local storage for user token on mount
        const checkUser = () => {
            const storedUser = localStorage.getItem("wfolio_user");
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) { }
            } else {
                setUser(null);
            }
        };

        checkUser();

        // Listen to custom auth events
        window.addEventListener("auth-change", checkUser);
        return () => window.removeEventListener("auth-change", checkUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("wfolio_token");
        localStorage.removeItem("wfolio_user");
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-muted/20 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold tracking-tight">
                    LENS<span className="text-muted-foreground font-light">CRAFT</span>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/portfolio" className="hover:text-muted-foreground transition-colors">Portfolio</Link>
                    <Link href="/about" className="hover:text-muted-foreground transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-muted-foreground transition-colors">Contact</Link>
                    <Link href="/client" className="hover:text-muted-foreground transition-colors">Client Drive</Link>
                </nav>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link
                                href="/admin"
                                className="text-sm font-medium px-4 py-2 hover:bg-muted rounded-full transition-colors hidden md:block"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium px-5 py-2.5 rounded-full border border-muted hover:bg-muted transition-colors"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium hidden md:block hover:text-muted-foreground transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm font-medium px-5 py-2.5 rounded-full bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
