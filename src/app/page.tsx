"use client";

import Link from "next/link";

// ── Icon helper (Material Symbols loaded in layout.tsx) ──
function Icon({
  name,
  className = "",
  filled = false,
  style,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}), ...style }}
    >
      {name}
    </span>
  );
}

// ── NavBar ──
function NavBar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-20 px-4 md:px-10 border-b"
      style={{
        backgroundColor: "rgba(19,19,19,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(73,68,85,0.2)",
      }}
    >
      <div className="flex items-center gap-8">
        <Link href="/">
          <span
            className="text-2xl font-bold tracking-tight cursor-pointer"
            style={{ fontFamily: "var(--font-playfair)", color: "#cdbdff" }}
          >
            Zamar.AI
          </span>
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {[
            { label: "Home", href: "/", active: true },
            { label: "Artistes", href: "/register?type=artiste" },
            { label: "Producers", href: "/register?type=producer" },
            { label: "AI Tools", href: "/dashboard" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium py-1 transition-colors duration-200"
              style={{
                fontFamily: "var(--font-hanken)",
                color: item.active ? "#cdbdff" : "#cac3d8",
                borderBottom: item.active ? "2px solid #7c4dff" : "none",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden sm:flex" style={{ color: "#948ea1" }} aria-label="Notifications">
          <Icon name="notifications" />
        </button>
        <button className="hidden sm:flex" style={{ color: "#948ea1" }} aria-label="Account">
          <Icon name="account_circle" />
        </button>
        <Link href="/register">
          <button
            className="px-6 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}
          >
            Get Started
          </button>
        </Link>
      </div>
    </header>
  );
}

// ── Hero ──
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20"
      style={{
        background:
          "radial-gradient(circle at 70% 20%, rgba(124,77,255,0.18) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(233,196,0,0.06) 0%, transparent 50%), #131313",
      }}
    >
      <div className="relative z-10 max-w-4xl">
        <span
          className="block mb-4 tracking-[0.2em] uppercase text-xs"
          style={{ fontFamily: "var(--font-jetbrains)", color: "#e9c400" }}
        >
          Enlightened Tech for Worship
        </span>

        <h1
          className="mb-6 leading-tight text-white"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(40px, 6vw, 64px)",
          }}
        >
          Divine Production.
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #cdbdff 0%, #00daf3 50%, #ffe16d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Human Soul.
          </span>
        </h1>

        <p
          className="mb-12 max-w-2xl mx-auto"
          style={{ fontFamily: "var(--font-hanken)", fontSize: "18px", lineHeight: "28px", color: "#cac3d8" }}
        >
          The world&apos;s first AI-powered gospel production ecosystem. Bridging
          the gap between spiritual inspiration and technical excellence.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {/* Artiste Card */}
          <div
            className="group p-8 rounded-xl w-full md:w-80 transition-all duration-200"
            style={{
              background: "rgba(32,31,31,0.6)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 40px -10px rgba(124,77,255,0.35)",
            }}
          >
            <Icon name="mic_external_on" filled className="text-4xl mb-4 block" style={{ color: "#cdbdff" }} />
            <h3 className="mb-2 text-white text-2xl font-semibold" style={{ fontFamily: "var(--font-playfair)" }}>
              For Artistes
            </h3>
            <p className="mb-6 text-sm" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>
              Schedule sessions, track distribution, and access divine creative support.
            </p>
            <Link href="/register?type=artiste">
              <button
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all border text-white hover:bg-[#7c4dff] hover:border-[#7c4dff]"
                style={{ fontFamily: "var(--font-hanken)", borderColor: "rgba(73,68,85,0.6)" }}
              >
                Start Journey
              </button>
            </Link>
          </div>

          {/* Producer Card */}
          <div
            className="group p-8 rounded-xl w-full md:w-80 transition-all duration-200"
            style={{
              background: "rgba(32,31,31,0.6)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 40px -10px rgba(233,196,0,0.25)",
            }}
          >
            <Icon name="equalizer" filled className="text-4xl mb-4 block" style={{ color: "#e9c400" }} />
            <h3 className="mb-2 text-white text-2xl font-semibold" style={{ fontFamily: "var(--font-playfair)" }}>
              For Producers
            </h3>
            <p className="mb-6 text-sm" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>
              Master the mix with AI insights and manage your studio workflow effortlessly.
            </p>
            <Link href="/register?type=producer">
              <button
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all border text-white hover:bg-[#e9c400] hover:border-[#e9c400] hover:text-[#221b00]"
                style={{ fontFamily: "var(--font-hanken)", borderColor: "rgba(73,68,85,0.6)" }}
              >
                Enter Studio
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features Bento Grid ──
function FeaturesSection() {
  return (
    <section className="py-24 px-4 md:px-10 max-w-[1280px] mx-auto">
      <div className="text-center mb-16">
        <h2
          className="mb-4 text-white"
          style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", fontWeight: 600 }}
        >
          Divine Ecosystem Features
        </h2>
        <div className="h-1 w-24 mx-auto rounded-full" style={{ background: "linear-gradient(90deg, #cdbdff, #00daf3)" }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Lyric Assistant — large */}
        <div
          className="md:col-span-8 group relative overflow-hidden rounded-xl p-8 flex flex-col justify-end min-h-[280px]"
          style={{ background: "rgba(32,31,31,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-25 transition-opacity duration-300">
            <Icon name="auto_awesome" className="text-8xl" style={{ color: "#cdbdff" }} />
          </div>
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="auto_awesome" style={{ color: "#e9c400" }} />
              <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-jetbrains)", color: "#e9c400" }}>
                Lyric Assistant AI
              </span>
            </div>
            <h3 className="mb-4 text-white" style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 600 }}>
              Never face a blank page again.
            </h3>
            <p className="mb-6 text-sm" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>
              Input scriptures or voice notes. Generate soulful verses in English,
              Yoruba, Igbo, Hausa, or Pidgin — refined by AI that understands ministry.
            </p>
            <div className="flex flex-wrap gap-2">
              {["SCALABLE CREATIVITY", "MULTILINGUAL"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-[10px]"
                  style={{ fontFamily: "var(--font-jetbrains)", color: "#00daf3", backgroundColor: "rgba(53,53,52,0.5)", border: "1px solid rgba(73,68,85,0.3)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SmartProduce */}
        <div
          className="md:col-span-4 rounded-xl p-8 flex flex-col justify-between min-h-[280px]"
          style={{ backgroundColor: "#7c4dff", boxShadow: "0 0 40px -10px rgba(124,77,255,0.35)" }}
        >
          <div>
            <Icon name="tune" className="text-4xl mb-4 block text-white" />
            <h3 className="mb-4" style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", fontWeight: 600, color: "#fcf6ff" }}>
              SmartProduce
            </h3>
            <p className="text-sm mb-6" style={{ fontFamily: "var(--font-hanken)", color: "rgba(252,246,255,0.8)" }}>
              Intelligent mixing and mastering advice tuned specifically for gospel audio profiles.
            </p>
          </div>
          <ul className="space-y-3">
            {["Vocal Balance Optimization", "EQ Recommendations", "Reverb Profiling"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-semibold" style={{ fontFamily: "var(--font-hanken)", color: "#fcf6ff" }}>
                <Icon name="check_circle" className="text-sm" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Music IQ */}
        <div
          className="md:col-span-4 rounded-xl p-8 flex flex-col justify-center min-h-[220px]"
          style={{ background: "rgba(32,31,31,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "4px solid #00daf3" }}
        >
          <Icon name="analytics" className="text-4xl mb-4" style={{ color: "#00daf3" }} />
          <h3 className="mb-2 text-white" style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 600 }}>Music IQ</h3>
          <p className="text-sm" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>
            Market positioning guidance, release timing, and playlist strategy powered by data.
          </p>
        </div>

        {/* Genre Benchmarking */}
        <div
          className="md:col-span-8 rounded-xl p-8 flex items-center gap-8 min-h-[220px]"
          style={{ background: "rgba(32,31,31,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="hidden sm:flex w-28 h-28 rounded-xl items-center justify-center flex-shrink-0" style={{ backgroundColor: "#2a2a2a" }}>
            <Icon name="compare_arrows" className="text-5xl" style={{ color: "#e9c400" }} />
          </div>
          <div>
            <h3 className="mb-2 text-white" style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", fontWeight: 600 }}>Genre Benchmarking</h3>
            <p className="text-sm" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>
              Compare your productions against successful Afro-gospel and Highlife worship standards to ensure world-class quality before release.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA ──
function CTASection() {
  return (
    <section className="py-24 px-4 relative">
      <div
        className="max-w-4xl mx-auto p-12 rounded-2xl text-center"
        style={{
          background: "rgba(32,31,31,0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(124,77,255,0.2)",
          boxShadow: "0 0 40px -10px rgba(124,77,255,0.35)",
        }}
      >
        <h2 className="mb-6 text-white" style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", fontWeight: 600 }}>
          Ready to amplify your ministry&apos;s sound?
        </h2>
        <p className="mb-10 max-w-xl mx-auto" style={{ fontFamily: "var(--font-hanken)", fontSize: "18px", color: "#948ea1" }}>
          Join the Zamar.AI network today and access professional-grade studio tools infused with spiritual insight.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <button className="px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}>
              Create Account
            </button>
          </Link>
          <Link href="/pricing">
            <button className="px-10 py-4 rounded-xl font-semibold text-lg transition-all text-white" style={{ border: "1px solid rgba(73,68,85,0.6)", fontFamily: "var(--font-hanken)" }}>
              View Pricing
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──
function Footer() {
  return (
    <footer
      className="w-full py-12 px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t"
      style={{ backgroundColor: "#0e0e0e", borderColor: "rgba(73,68,85,0.2)" }}
    >
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair)", color: "#e5e2e1" }}>
          Zamar.AI
        </span>
        <p className="text-sm max-w-xs text-center md:text-left" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>
          A Ministry of i-Yadah Network. Empowering the sound of the kingdom.
        </p>
      </div>
      <nav className="flex flex-wrap justify-center gap-6">
        {["Terms of Grace", "Privacy Policy", "Contact Support", "Ministry Affiliations"].map((link) => (
          <Link key={link} href="#" className="text-xs uppercase tracking-wider transition-colors" style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}>
            {link}
          </Link>
        ))}
      </nav>
      <div className="text-xs" style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}>
        © 2026 Zamar.AI • i-Yadah Network
      </div>
    </footer>
  );
}

// ── Page Export ──
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#131313" }}>
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
