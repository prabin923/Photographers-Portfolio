import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-premium-gradient text-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden p-6">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-blue-500/5 rounded-full blur-[120px] z-0 animate-pulse"></div>

        <div className="relative z-10 text-center max-w-5xl slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8 mx-auto shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            Next Generation Platform
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-gradient leading-[0.9]">
            Elevate Your <br />
            <span className="opacity-40 italic font-medium">Visual Legacy</span>
          </h1>
          <p className="text-lg md:text-xl text-white/30 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            The elite ecosystem for modern photographers. Showcase masterpieces, deliver private collections, and orchestrate your business with state-of-the-art precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/portfolio"
              className="px-10 py-5 rounded-3xl bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-105 transition-all w-full sm:w-auto accent-glow"
            >
              Explore Portfolio
            </Link>
            <Link
              href="/admin"
              className="px-10 py-5 rounded-3xl glass-dark border border-white/10 font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all w-full sm:w-auto"
            >
              Enter Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-24 fade-in">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Engineered for Excellence</h2>
            <p className="text-white/30 text-lg font-medium max-w-xl mx-auto">Sophisticated tools designed specifically for high-end photography workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Cloud Sanctuary",
                icon: "☁️",
                desc: "The ultimate private delivery experience. Securely orchestrated galleries where clients rediscover their most precious moments."
              },
              {
                title: "Artistic Selection",
                icon: "✨",
                desc: "High-fidelity feedback loops. Enable clients to curate their favorites with seamless, intuitive interactions."
              },
              {
                title: "Aesthetic Preview",
                icon: "🎭",
                desc: "Immersive real-time orchestration. Customize every visual detail to match your unique artistic brand identity."
              }
            ].map((feat, i) => (
              <div key={i} className="glass-dark border border-white/5 p-12 rounded-[3rem] transition-all hover:border-blue-500/30 group slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 rounded-2xl bg-white/5 mb-8 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors">{feat.title}</h3>
                <p className="text-white/30 text-sm font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-10 text-center slide-up">
          <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter">Ready to redefine your <br /> artistic presence?</h2>
          <p className="text-lg text-white/30 mb-12 font-medium leading-relaxed">
            Join the elite community of visionaries redefining the standard of visual delivery.
          </p>
          <Link
            href="/admin"
            className="px-12 py-6 rounded-3xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all inline-block accent-glow"
          >
            Initialize Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
