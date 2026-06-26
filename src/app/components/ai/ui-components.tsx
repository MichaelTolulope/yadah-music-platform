"use client"
import { useState } from "react";
import { useEffect, useRef } from "react";
import { AIResult } from "@/lib/ai/types";
import Link from "next/link";

// ── Icon helper ──
export function Icon({
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
export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const NAV = [
    { icon: "space_dashboard", label: "Dashboard", href: "/dashboard", active: false },
    { icon: "folder_open", label: "My Projects", href: "/projects", active: false },
    // { icon: "lyrics", label: "Lyric Assistant", href: "/lyric-assistant", active: true },
    { icon: "graphic_eq", label: "Create", href: "/ai-create", active: false },
    { icon: "bar_chart", label: "Music IQ", href: "/music-iq", active: false },
    { icon: "calendar_month", label: "Studio Sessions", href: "/sessions", active: false },
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

// ── Copy button ──
export function CopyButton({ text }: { text: string }) {
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
export function LyricCard({ result, onSave }: { result: AIResult; onSave: (r: AIResult) => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
export function StreamingText({ text }: { text: string }) {
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