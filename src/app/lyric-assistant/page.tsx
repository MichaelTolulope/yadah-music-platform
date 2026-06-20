"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

// ── Types ──
interface LyricResult {
  id: string;
  prompt: string;
  language: string;
  style: string;
  lyrics: string;
  created_at: string;
}

// ── Icon helper ──
function Icon({
  name, className = "", style, filled = false,
}: {
  name: string; className?: string; style?: React.CSSProperties; filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0", lineHeight: 1, ...style }}
    >
      {name}
    </span>
  );
}

// ── Sidebar ──
function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const NAV = [
    { icon: "space_dashboard", label: "Dashboard",       href: "/dashboard",       active: false },
    { icon: "folder_open",     label: "My Projects",     href: "/projects",        active: false },
    { icon: "lyrics",          label: "Lyric Assistant", href: "/lyric-assistant", active: true  },
    { icon: "graphic_eq",      label: "SmartProduce",    href: "/smart-produce",   active: false },
    { icon: "bar_chart",       label: "Music IQ",        href: "/music-iq",        active: false },
    { icon: "calendar_month",  label: "Studio Sessions", href: "/sessions",        active: false },
  ];
  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen border-r flex-shrink-0"
      style={{ backgroundColor: "#0e0e0e", borderColor: "rgba(73,68,85,0.25)" }}
    >
      <div className="flex items-center h-20 px-5 border-b flex-shrink-0" style={{ borderColor: "rgba(73,68,85,0.25)" }}>
        <Link href="/"><span className="text-xl font-bold tracking-tight cursor-pointer" style={{ fontFamily: "var(--font-playfair)", color: "#cdbdff" }}>Zamar.AI</span></Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => (
          <Link key={item.label} href={item.href}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer"
              style={{ backgroundColor: item.active ? "rgba(124,77,255,0.15)" : "transparent", border: item.active ? "1px solid rgba(124,77,255,0.3)" : "1px solid transparent" }}
              onMouseEnter={e => { if (!item.active) (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(73,68,85,0.15)"; }}
              onMouseLeave={e => { if (!item.active) (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"; }}
            >
              <Icon name={item.icon} filled={item.active} style={{ color: item.active ? "#cdbdff" : "#948ea1", fontSize: "20px", width: "20px", flexShrink: 0 }} />
              <span className="text-sm truncate" style={{ fontFamily: "var(--font-hanken)", fontWeight: item.active ? 600 : 400, color: item.active ? "#cdbdff" : "#cac3d8" }}>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
        <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left" style={{ color: "#948ea1" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(73,68,85,0.2)"; (e.currentTarget as HTMLButtonElement).style.color = "#e5e2e1"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#948ea1"; }}
        >
          <Icon name="logout" style={{ fontSize: "20px", width: "20px", flexShrink: 0, color: "inherit" }} />
          <span className="text-sm" style={{ fontFamily: "var(--font-hanken)" }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// ── Language options ──
const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin", "French"];

// ── Style options ──
const STYLES = [
  { value: "afro-gospel",    label: "Afro-Gospel"         },
  { value: "contemporary",   label: "Contemporary Gospel"  },
  { value: "highlife",       label: "Highlife Worship"     },
  { value: "gospel-hiphop",  label: "Gospel Hip-Hop"       },
  { value: "hymn",           label: "Traditional Hymn"     },
  { value: "praise-worship", label: "Praise & Worship"     },
];

// ── Scripture prompt suggestions ──
const SUGGESTIONS = [
  "Psalm 23 — The Lord is my shepherd",
  "Isaiah 40:31 — They shall mount up with wings",
  "Philippians 4:13 — I can do all things through Christ",
  "A song about God's faithfulness in hard times",
  "Worship anthem for Sunday morning service",
  "Prayer song asking for divine direction",
];

// ── Copy button ──
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        fontFamily: "var(--font-hanken)",
        color: copied ? "#cdbdff" : "#948ea1",
        backgroundColor: copied ? "rgba(124,77,255,0.15)" : "rgba(73,68,85,0.15)",
        border: `1px solid ${copied ? "rgba(124,77,255,0.3)" : "rgba(73,68,85,0.2)"}`,
      }}
    >
      <Icon name={copied ? "check" : "content_copy"} style={{ fontSize: "14px" }} />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Lyric Result Card ──
function LyricCard({ result, onSave }: { result: LyricResult; onSave: (r: LyricResult) => void }) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(result);
    setSaved(true);
    setSaving(false);
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(28,27,27,0.8)",
        border: "1px solid rgba(124,77,255,0.2)",
        boxShadow: "0 0 40px -12px rgba(124,77,255,0.2)",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" filled style={{ color: "#e9c400", fontSize: "18px" }} />
          <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            Generated Lyrics
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px]"
            style={{ fontFamily: "var(--font-jetbrains)", color: "#00daf3", backgroundColor: "rgba(0,218,243,0.1)", border: "1px solid rgba(0,218,243,0.2)" }}
          >
            {result.language}
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px]"
            style={{ fontFamily: "var(--font-jetbrains)", color: "#cdbdff", backgroundColor: "rgba(124,77,255,0.1)", border: "1px solid rgba(124,77,255,0.2)" }}
          >
            {result.style}
          </span>
          <CopyButton text={result.lyrics} />
        </div>
      </div>

      {/* Lyrics body */}
      <div className="px-5 py-5">
        <pre
          className="whitespace-pre-wrap text-sm leading-loose"
          style={{ fontFamily: "var(--font-hanken)", color: "#e5e2e1" }}
        >
          {result.lyrics}
        </pre>
      </div>

      {/* Card footer */}
      <div
        className="flex items-center justify-between px-5 py-4 border-t"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <p className="text-xs" style={{ fontFamily: "var(--font-jetbrains)", color: "#494455", fontSize: "10px" }}>
          {new Date(result.created_at).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          style={{
            fontFamily: "var(--font-hanken)",
            backgroundColor: saved ? "rgba(124,77,255,0.15)" : "#7c4dff",
            color: saved ? "#cdbdff" : "#fcf6ff",
            border: saved ? "1px solid rgba(124,77,255,0.3)" : "none",
          }}
        >
          <Icon name={saved ? "check_circle" : "save"} filled={saved} style={{ fontSize: "14px" }} />
          {saving ? "Saving…" : saved ? "Saved to Project" : "Save to Project"}
        </button>
      </div>
    </div>
  );
}

// ── Streaming text animation ──
function StreamingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 8);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <pre className="whitespace-pre-wrap text-sm leading-loose" style={{ fontFamily: "var(--font-hanken)", color: "#e5e2e1" }}>
      {displayed}
      <span className="animate-pulse" style={{ color: "#7c4dff" }}>|</span>
    </pre>
  );
}

// ── Main Page ──
export default function LyricAssistantPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [prompt,      setPrompt]      = useState("");
  const [language,    setLanguage]    = useState("English");
  const [style,       setStyle]       = useState("afro-gospel");
  const [generating,  setGenerating]  = useState(false);
  const [result,      setResult]      = useState<LyricResult | null>(null);
  const [streaming,   setStreaming]    = useState(false);
  const [error,       setError]       = useState("");
  const [history,     setHistory]     = useState<LyricResult[]>([]);
  const [credits,     setCredits]     = useState<number | null>(null);
  const [userId,      setUserId]      = useState<string>("");

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setUserId(user.id);

      // Load credits + recent lyric history
      const [credRes, histRes] = await Promise.all([
        supabase.from("credits").select("balance").eq("user_id", user.id).single(),
        supabase
          .from("generation_requests")
          .select("id, prompt, model_params, result_data, created_at")
          .eq("user_id", user.id)
          .eq("type", "lyrics")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (credRes.data) setCredits(credRes.data.balance);

      if (histRes.data) {
        const mapped: LyricResult[] = histRes.data
          .filter(r => r.result_data?.lyrics)
          .map(r => ({
            id:         r.id,
            prompt:     r.prompt,
            language:   r.model_params?.language ?? "English",
            style:      r.model_params?.style ?? "afro-gospel",
            lyrics:     r.result_data.lyrics,
            created_at: r.created_at,
          }));
        setHistory(mapped);
      }
    }
    init();
  }, [router, supabase]);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    if (credits !== null && credits < 1) {
      setError("You have no credits remaining. Please upgrade your plan.");
      return;
    }

    setGenerating(true);
    setStreaming(false);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:     "lyrics",
          prompt:   prompt.trim(),
          language,
          style,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setGenerating(false);
        return;
      }

      // Show streaming animation then reveal full result
      const newResult: LyricResult = {
        id:         data.request_id,
        prompt:     prompt.trim(),
        language,
        style,
        lyrics:     data.lyrics,
        created_at: new Date().toISOString(),
      };

      setResult(newResult);
      setStreaming(true);
      if (credits !== null) setCredits(c => (c ?? 1) - 1);

      // Add to history
      setHistory(prev => [newResult, ...prev.slice(0, 4)]);

      setTimeout(() => setStreaming(false), newResult.lyrics.length * 8 + 500);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveToProject(lyric: LyricResult) {
    // Creates a track record linked to the user's first active project
    // In future: show a project picker modal
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (!project) return;

    await supabase.from("tracks").insert({
      project_id: project.id,
      owner_id:   userId,
      title:      lyric.prompt.slice(0, 60),
      status:     "draft",
      metadata:   { lyrics: lyric.lyrics, language: lyric.language, style: lyric.style },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Sidebar onSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between h-20 px-6 border-b flex-shrink-0"
          style={{ backgroundColor: "rgba(19,19,19,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderColor: "rgba(73,68,85,0.25)" }}
        >
          <div>
            <p className="text-xs mb-0.5" style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}>AI Tools</p>
            <h1 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Lyric Assistant</h1>
          </div>
          {/* Credit indicator */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.25)" }}
          >
            <Icon name="toll" filled style={{ color: "#e9c400", fontSize: "18px" }} />
            <span className="text-sm font-bold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e9c400" }}>
              {credits ?? "—"}
            </span>
            <span className="text-xs" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>credits left</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── Left: Generator panel ── */}
            <div className="xl:col-span-2 space-y-6">

              {/* Input card */}
              <div
                className="rounded-xl p-6"
                style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Icon name="auto_awesome" filled style={{ color: "#e9c400", fontSize: "20px" }} />
                  <h2 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                    Describe Your Song
                  </h2>
                </div>

                {/* Prompt textarea */}
                <div className="mb-4">
                  <label className="block text-xs mb-1.5" style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}>
                    SCRIPTURE / THEME / MOOD *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g. Psalm 23 — a song of comfort and trust in God's guidance…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all resize-none"
                    style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                    onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
                    disabled={generating}
                    maxLength={500}
                  />
                  <p className="text-right text-xs mt-1" style={{ fontFamily: "var(--font-jetbrains)", color: "#494455", fontSize: "10px" }}>
                    {prompt.length}/500
                  </p>
                </div>

                {/* Language + Style row */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}>LANGUAGE</label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.map(l => (
                        <button
                          key={l}
                          onClick={() => setLanguage(l)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            fontFamily: "var(--font-hanken)",
                            backgroundColor: language === l ? "rgba(0,218,243,0.15)" : "rgba(73,68,85,0.12)",
                            color: language === l ? "#00daf3" : "#948ea1",
                            border: `1px solid ${language === l ? "rgba(0,218,243,0.3)" : "rgba(73,68,85,0.2)"}`,
                          }}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5" style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}>STYLE</label>
                    <select
                      value={style}
                      onChange={e => setStyle(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                      style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)", color: "#e5e2e1" }}
                      onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
                    >
                      {STYLES.map(s => (
                        <option key={s.value} value={s.value} style={{ backgroundColor: "#201f1f" }}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.2)" }}>
                    <Icon name="error" filled style={{ color: "#ffb4ab", fontSize: "16px" }} />
                    <p className="text-xs" style={{ fontFamily: "var(--font-hanken)", color: "#ffb4ab" }}>{error}</p>
                  </div>
                )}

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}
                >
                  {generating ? (
                    <>
                      <Icon name="sync" className="animate-spin" style={{ fontSize: "18px" }} />
                      Composing your lyrics…
                    </>
                  ) : (
                    <>
                      <Icon name="auto_awesome" filled style={{ fontSize: "18px" }} />
                      Generate Lyrics — 1 Credit
                    </>
                  )}
                </button>
              </div>

              {/* Result */}
              {result && (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(124,77,255,0.25)", boxShadow: "0 0 40px -12px rgba(124,77,255,0.2)" }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
                    <div className="flex items-center gap-2">
                      <Icon name="auto_awesome" filled style={{ color: "#e9c400", fontSize: "18px" }} />
                      <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Generated Lyrics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px]" style={{ fontFamily: "var(--font-jetbrains)", color: "#00daf3", backgroundColor: "rgba(0,218,243,0.1)", border: "1px solid rgba(0,218,243,0.2)" }}>{result.language}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] capitalize" style={{ fontFamily: "var(--font-jetbrains)", color: "#cdbdff", backgroundColor: "rgba(124,77,255,0.1)", border: "1px solid rgba(124,77,255,0.2)" }}>{result.style.replace("-", " ")}</span>
                      <CopyButton text={result.lyrics} />
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    {streaming ? <StreamingText text={result.lyrics} /> : (
                      <pre className="whitespace-pre-wrap text-sm leading-loose" style={{ fontFamily: "var(--font-hanken)", color: "#e5e2e1" }}>{result.lyrics}</pre>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
                    <button
                      onClick={() => { setResult(null); setPrompt(""); }}
                      className="flex items-center gap-1.5 text-xs transition-all"
                      style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
                    >
                      <Icon name="refresh" style={{ fontSize: "14px" }} />
                      Start over
                    </button>
                    <button
                      onClick={() => handleSaveToProject(result)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}
                    >
                      <Icon name="save" style={{ fontSize: "14px" }} />
                      Save to Project
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: suggestions + history ── */}
            <div className="space-y-5">

              {/* Prompt suggestions */}
              <div className="rounded-xl overflow-hidden" style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
                  <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Inspiration Seeds</h3>
                  <p className="text-xs mt-0.5" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>Click any to use as your prompt</p>
                </div>
                <div className="p-3 space-y-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setPrompt(s)}
                      className="w-full text-left px-4 py-3 rounded-lg text-xs transition-all"
                      style={{ fontFamily: "var(--font-hanken)", color: "#cac3d8", border: "1px solid rgba(73,68,85,0.15)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(124,77,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,77,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "#e5e2e1"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(73,68,85,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#cac3d8"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div
                className="p-5 rounded-xl"
                style={{ background: "linear-gradient(135deg, rgba(233,196,0,0.06) 0%, rgba(124,77,255,0.06) 100%)", border: "1px solid rgba(233,196,0,0.15)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="lightbulb" filled style={{ color: "#e9c400", fontSize: "16px" }} />
                  <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-jetbrains)", color: "#e9c400", fontSize: "10px", letterSpacing: "0.1em" }}>DIVINE TIPS</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Include a specific scripture reference for more focused lyrics",
                    "Mention the target audience (children, congregation, youth)",
                    "Specify the tempo feel (slow and reverent, upbeat and celebratory)",
                    "Add the occasion (Sunday service, wedding, revival)",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>
                      <span className="mt-0.5 flex-shrink-0" style={{ color: "#7c4dff" }}>•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* History */}
              {history.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
                    <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Recent Generations</h3>
                  </div>
                  <div className="divide-y" style={{ borderColor: "rgba(73,68,85,0.12)" }}>
                    {history.map(h => (
                      <button
                        key={h.id}
                        onClick={() => { setResult(h); setPrompt(h.prompt); setStreaming(false); }}
                        className="w-full text-left px-5 py-3.5 transition-all"
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(124,77,255,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <p className="text-xs font-medium text-white truncate mb-0.5" style={{ fontFamily: "var(--font-hanken)" }}>{h.prompt.slice(0, 50)}{h.prompt.length > 50 ? "…" : ""}</p>
                        <p className="text-[10px]" style={{ fontFamily: "var(--font-jetbrains)", color: "#494455" }}>
                          {h.language} · {h.style} · {new Date(h.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
