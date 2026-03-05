"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    if (pathname.startsWith("/admin")) return null;
    return (
        <footer className="border-t border-muted/20 bg-background py-12 text-sm text-center md:text-left">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <Link href="/" className="text-xl font-black tracking-tighter text-gradient">
                        LensDrive
                    </Link>
                    <p className="text-muted-foreground">
                        Capturing timeless moments with an artistic touch. Beautifully crafted portfolio and client delivery platform.
                    </p>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Navigation</h4>
                    <ul className="space-y-2 text-muted-foreground">
                        <li><Link href="/" className="hover:text-foreground transition-colors">Portfolio</Link></li>
                        <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                        <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Clients</h4>
                    <ul className="space-y-2 text-muted-foreground">
                        <li><Link href="/client" className="hover:text-foreground transition-colors">Client Login</Link></li>
                        <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                        <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Connect</h4>
                    <ul className="space-y-2 text-muted-foreground">
                        <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Twitter (X)</a></li>
                        <li><a href="#" className="hover:text-foreground transition-colors">Pinterest</a></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 mt-12 pt-8 border-t border-muted/20 text-muted-foreground text-center flex flex-col md:flex-row items-center justify-between">
                <p>&copy; {new Date().getFullYear()} LensDrive Photography. All rights reserved.</p>
                <p className="mt-2 md:mt-0">Powered by the custom portfolio platform.</p>
            </div>
        </footer>
    );
}
