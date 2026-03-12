"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to log in");
            }

            // Store token
            localStorage.setItem("wfolio_token", data.token);
            localStorage.setItem("wfolio_user", JSON.stringify(data.user));

            // Save to saved accounts list for account switching
            const savedRaw = localStorage.getItem("wfolio_saved_accounts");
            const savedAccounts: { id: string; name: string; email: string; token: string }[] = savedRaw ? JSON.parse(savedRaw) : [];
            const existingIdx = savedAccounts.findIndex(a => a.id === data.user.id);
            const accountEntry = { id: data.user.id, name: data.user.name, email: data.user.email, token: data.token };
            if (existingIdx >= 0) {
                savedAccounts[existingIdx] = accountEntry;
            } else {
                savedAccounts.push(accountEntry);
            }
            localStorage.setItem("wfolio_saved_accounts", JSON.stringify(savedAccounts));

            window.dispatchEvent(new Event("auth-change"));
            router.push("/admin");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-muted/10">
            <div className="w-full max-w-md bg-background border border-muted rounded-2xl p-8 shadow-sm slide-up">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Log in to manage your portfolio</p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 text-rose-500 p-3 rounded-lg text-sm mb-6 border border-rose-500/20 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground transition-all"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-muted bg-background focus:outline-none focus:ring-2 focus:ring-foreground transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity mt-4"
                    >
                        {isLoading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Don't have an account? <Link href="/signup" className="text-foreground font-medium underline">Sign up</Link>
                </div>
            </div>
        </div>
    );
}
