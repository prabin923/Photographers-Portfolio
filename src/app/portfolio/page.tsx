import PhotoGrid, { Photo } from "@/components/PhotoGrid";

const PORTFOLIO_PHOTOS: Photo[] = [
    { id: "p1", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2669&auto=format&fit=crop", title: "Wedding Moments" },
    { id: "p2", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2670&auto=format&fit=crop", title: "Fashion Editorial" },
    { id: "p3", url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2670&auto=format&fit=crop", title: "Love & Light" },
    { id: "p4", url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=2674&auto=format&fit=crop", title: "Puppy Portraits" },
    { id: "p5", url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2671&auto=format&fit=crop", title: "Urban Exploration" },
    { id: "p6", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2670&auto=format&fit=crop", title: "Nature's Serenity" },
];

export default function PortfolioPage() {
    return (
        <div className="min-h-screen bg-premium-gradient text-white font-sans overflow-y-auto custom-scrollbar flex flex-col p-10">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-20 slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6 mx-auto shadow-xl">
                        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                        Curated Collection
                    </div>
                    <h1 className="text-6xl font-black mb-6 tracking-tighter text-gradient">Featured Portfolio</h1>
                    <p className="text-white/30 max-w-xl mx-auto text-sm font-medium leading-relaxed tracking-wide">
                        A selection of our latest and most cherished captures. Enjoy the stories behind the lens, crafted with precision and artistic soul.
                    </p>
                </div>

                <div className="glass-dark border border-white/5 rounded-[3rem] p-8 md:p-12 mb-20">
                    <PhotoGrid photos={PORTFOLIO_PHOTOS} />
                </div>
            </div>
        </div>
    );
}
