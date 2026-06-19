"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setStatus("loading");

    try {
      // TODO: wire to /api/generate once backend is ready
      await new Promise((r) => setTimeout(r, 2000)); // simulate network call
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0f] font-sans text-white">

      {/* NAV */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-xl font-bold tracking-tight text-white">
            Yadah <span className="text-violet-400">Music AI</span>
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-white/60">
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
          <a
            href="/login"
            className="px-4 py-2 rounded-full border border-violet-500 text-violet-400 hover:bg-violet-500 hover:text-white transition-all text-sm"
          >
            Sign In
          </a>
        </nav>
      </header>

      {/* HERO */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">

        {/* Glow orb */}
        <div
          aria-hidden
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
          }}
        />

        <p className="mb-3 text-xs font-semibold tracking-widest text-violet-400 uppercase">
          AI Music Generation
        </p>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 max-w-3xl">
          Describe it.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            Hear it.
          </span>
        </h1>
        <p className="mb-10 max-w-md text-white/50 text-lg leading-relaxed">
          Type a mood, genre, or scene — Yadah composes a full original track in seconds.
        </p>

        {/* Generator card */}
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-2xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A cinematic orchestral piece with rising tension, perfect for a movie trailer…"
            className="w-full bg-transparent resize-none text-white placeholder-white/30 text-base outline-none leading-relaxed"
            rows={4}
            disabled={isGenerating}
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-white/30">{prompt.length} characters</span>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating…" : "Generate Track"}
            </button>
          </div>
        </div>

        {/* Status feedback */}
        {status === "loading" && (
          <p className="mt-6 text-sm text-violet-400 animate-pulse">
            ⏳ Composing your track — this takes about 20–30 seconds…
          </p>
        )}
        {status === "done" && (
          <p className="mt-6 text-sm text-green-400">
            ✅ Track ready! (Audio player coming soon — backend integration next.)
          </p>
        )}
        {status === "error" && (
          <p className="mt-6 text-sm text-red-400">
            ❌ Something went wrong. Check your connection and try again.
          </p>
        )}

        {/* Example prompts */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {[
            "Lo-fi hip hop for studying",
            "Afrobeats summer vibe",
            "Epic film score with choir",
            "Gentle piano for meditation",
          ].map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="px-3 py-1.5 rounded-full border border-white/10 text-white/40 text-xs hover:border-violet-500 hover:text-violet-300 transition-all"
            >
              {ex}
            </button>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-8 py-5 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
        <span>© 2026 Yadah Music AI</span>
        <span>Powered by Bark · EnCodec · Supabase</span>
      </footer>
    </div>
  );
}
