import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background dark overlay for default aesthetic */}
        <div className="absolute inset-0 bg-background/90 z-0"></div>
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent/5 rounded-full blur-[100px] z-0"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl slide-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
            Stunning Portfolios for <br className="hidden md:block" />
            <span className="text-muted-foreground italic font-medium">Smart Photographers</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create a beautiful website in minutes. Upload galleries, deliver client drives, and grow your photography business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/portfolio"
              className="px-8 py-4 rounded-full bg-foreground text-background font-semibold text-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
              View Portfolios
            </Link>
            <Link
              href="/admin"
              className="px-8 py-4 rounded-full border border-muted-foreground/30 font-semibold text-lg hover:bg-muted transition-colors w-full sm:w-auto"
            >
              Start for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg">Designed specifically for the modern photographer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Cloud Drive",
                desc: "The best way to share. Upload your work onto your website, where clients can view, select favorites, and download."
              },
              {
                title: "Client Favorites",
                desc: "Keep in touch with your clients. They can create a list of favorite photos by simply clicking 'like'."
              },
              {
                title: "Stunning Galleries",
                desc: "Impress your audience. Our galleries are designed with simplicity and style in mind."
              }
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 rounded-2xl bg-accent mb-6 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-background border-4 border-foreground"></div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-muted/20">
        <div className="container mx-auto px-6 text-center max-w-3xl slide-up">
          <h2 className="text-4xl font-bold mb-6">Ready to create your ideal website?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of creative individuals and creative minds using our platform.
          </p>
          <Link
            href="/admin"
            className="px-8 py-4 rounded-full bg-accent text-accent-foreground font-semibold text-lg hover:opacity-90 transition-opacity inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
