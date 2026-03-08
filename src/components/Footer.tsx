"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Pages that belong to the photographer's personal website
const PHOTOGRAPHER_PAGES = ["/portfolio", "/contact", "/client"];

export default function Footer() {
    const pathname = usePathname();
    const [photographerName, setPhotographerName] = useState("");
    const [site, setSite] = useState({ email: "", phone: "", instagramUrl: "#", twitterUrl: "#", pinterestUrl: "#" });

    // Hide on home page, admin, and auth pages
    if (pathname.startsWith("/admin") || pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/signup")) return null;

    const isPhotographerPage = PHOTOGRAPHER_PAGES.some(p => pathname.startsWith(p));

    // ── PHOTOGRAPHER'S PERSONAL FOOTER ──
    if (isPhotographerPage) {
        return <PhotographerFooter />;
    }

    // ── LENSFOLIO SAAS FOOTER ──
    return (
        <footer className="border-t border-muted/20 bg-background py-12 text-sm text-center">
            <div className="container mx-auto px-6">
                <div className="space-y-4">
                    <Link href="/" className="text-xl font-black tracking-tighter text-gradient">
                        LensFolio
                    </Link>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        The premium portfolio and client delivery platform for modern photographers.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-muted-foreground pt-2">
                        <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                        <Link href="/login" className="hover:text-foreground transition-colors">Log In</Link>
                        <Link href="/signup" className="hover:text-foreground transition-colors">Get Started</Link>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-muted/20 text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} LensFolio. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

// Separate component so hooks work correctly (can't use hooks after conditional returns)
function PhotographerFooter() {
    const [photographerName, setPhotographerName] = useState("");
    const [site, setSite] = useState({ email: "", phone: "", instagramUrl: "#", twitterUrl: "#", pinterestUrl: "#" });

    useEffect(() => {
        fetch("http://localhost:4000/api/site")
            .then(res => res.json())
            .then(data => {
                if (data.photographerName) setPhotographerName(data.photographerName);
                setSite(prev => ({
                    ...prev,
                    email: data.email || "",
                    phone: data.phone || "",
                    instagramUrl: data.instagramUrl || "#",
                    twitterUrl: data.twitterUrl || "#",
                    pinterestUrl: data.pinterestUrl || "#",
                }));
            })
            .catch(() => { });
    }, []);

    return (
        <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm py-12 text-sm text-center md:text-left">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Photographer brand */}
                <div className="space-y-4">
                    <Link href="/portfolio" className="text-xl font-black tracking-tighter text-white">
                        {photographerName || "Studio"}
                    </Link>
                    <p className="text-white/30 text-xs leading-relaxed">
                        Professional photography studio. Capturing timeless moments with an artistic touch.
                    </p>
                </div>

                {/* Navigation */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-white/60 text-xs uppercase tracking-widest">Navigation</h4>
                    <ul className="space-y-2 text-white/30">
                        <li><Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        <li><Link href="/client" className="hover:text-white transition-colors">Client Gallery</Link></li>
                    </ul>
                </div>

                {/* Connect */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-white/60 text-xs uppercase tracking-widest">Connect</h4>
                    <ul className="space-y-2 text-white/30">
                        {site.instagramUrl && site.instagramUrl !== "#" && (
                            <li><a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                        )}
                        {site.twitterUrl && site.twitterUrl !== "#" && (
                            <li><a href={site.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter / X</a></li>
                        )}
                        {site.pinterestUrl && site.pinterestUrl !== "#" && (
                            <li><a href={site.pinterestUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Pinterest</a></li>
                        )}
                        {site.email && <li><a href={`mailto:${site.email}`} className="hover:text-white transition-colors">{site.email}</a></li>}
                    </ul>
                </div>
            </div>

            {/* "Powered by LensFolio" trademark */}
            <div className="container mx-auto px-6 mt-10 pt-6 border-t border-white/5 text-center flex flex-col md:flex-row items-center justify-between">
                <p className="text-white/20 text-xs">&copy; {new Date().getFullYear()} {photographerName || "Studio"}. All rights reserved.</p>
                <a href="/" className="mt-2 md:mt-0 text-white/15 text-[10px] uppercase tracking-widest font-bold hover:text-white/30 transition-colors flex items-center gap-1.5">
                    <span className="text-sm">◈</span> Powered by LensFolio
                </a>
            </div>
        </footer>
    );
}
