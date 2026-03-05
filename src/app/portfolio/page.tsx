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
        <div className="container mx-auto px-6 py-12 flex-1">
            <div className="max-w-3xl mb-12 slide-up">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Featured Portfolio</h1>
                <p className="text-lg text-muted-foreground">
                    A selection of our latest and most cherished captures.
                    Enjoy the stories behind the lens.
                </p>
            </div>

            <PhotoGrid photos={PORTFOLIO_PHOTOS} />
        </div>
    );
}
