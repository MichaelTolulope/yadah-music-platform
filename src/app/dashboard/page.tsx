"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { Profile, Project, GenerationRequest, Credits } from "@/lib/global/types";
import Sidebar from "@/app/components/Sidebar";


// ── Icon helper ──
// Only uses icon names confirmed to exist in Material Symbols Outlined
function Icon({
  name,
  className = "",
  style,
  filled = false,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        lineHeight: 1,
        ...style,
      }}
    >
      {name}
    </span>
  );
}


// ── Top Bar ──
function TopBar({ profile }: { profile: Profile | null }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header
      className="flex items-center justify-between h-20 px-6 border-b flex-shrink-0"
      style={{
        backgroundColor: "rgba(19,19,19,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(73,68,85,0.25)",
      }}
    >
      <div>
        <p
          className="text-xs mb-0.5"
          style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}
        >
          {greeting},
        </p>
        <h1
          className="text-xl font-semibold text-white leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {profile?.full_name ?? "Welcome"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
          style={{ color: "#948ea1" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(73,68,85,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
          aria-label="Notifications"
        >
          <Icon name="notifications" style={{ fontSize: "20px" }} />
        </button>
        <Link href="/projects">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: "#7c4dff",
              color: "#fcf6ff",
              fontFamily: "var(--font-hanken)",
            }}
          >
            <Icon name="add" style={{ fontSize: "18px" }} />
            New Project
          </button>
        </Link>
      </div>
    </header>
  );
}

// ── Stat Card ──
function StatCard({
  icon,
  label,
  value,
  sub,
  accentColor,
  glowColor,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
  glowColor: string;
}) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{
        background: "rgba(28,27,27,0.8)",
        border: "1px solid rgba(73,68,85,0.2)",
        boxShadow: `0 0 30px -12px ${glowColor}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}1a` }}
        >
          <Icon name={icon} filled style={{ color: accentColor, fontSize: "18px" }} />
        </div>
        <span
          className="text-xs tracking-wider uppercase"
          style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1", fontSize: "10px" }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-3xl font-bold text-white leading-none mb-1"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs"
          style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Recent Projects ──
function RecentProjects({ projects }: { projects: Project[] }) {
  const statusMeta: Record<string, { color: string; label: string }> = {
    active:   { color: "#cdbdff", label: "Active"   },
    archived: { color: "#948ea1", label: "Archived" },
    deleted:  { color: "#ffb4ab", label: "Deleted"  },
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(28,27,27,0.8)",
        border: "1px solid rgba(73,68,85,0.2)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <h2
          className="text-base font-semibold text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Recent Projects
        </h2>
        <Link href="/projects">
          <span
            className="text-xs font-medium cursor-pointer transition-colors"
            style={{ fontFamily: "var(--font-hanken)", color: "#7c4dff" }}
          >
            View all →
          </span>
        </Link>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(73,68,85,0.2)" }}
          >
            <Icon name="folder_open" style={{ color: "#494455", fontSize: "28px" }} />
          </div>
          <p
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
          >
            No projects yet. Start your first divine production.
          </p>
          <Link href="/projects">
            <button
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}
            >
              Create Project
            </button>
          </Link>
        </div>
      ) : (
        <ul>
          {projects.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all"
              style={{
                borderBottom: i < projects.length - 1 ? "1px solid rgba(73,68,85,0.12)" : "none",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLLIElement).style.backgroundColor = "rgba(124,77,255,0.05)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLLIElement).style.backgroundColor = "transparent")
              }
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(124,77,255,0.15)" }}
              >
                <Icon name="music_note" filled style={{ color: "#cdbdff", fontSize: "18px" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-white truncate leading-tight"
                  style={{ fontFamily: "var(--font-hanken)" }}
                >
                  {p.title}
                </p>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1", fontSize: "11px" }}
                >
                  {p.genre ?? "No genre"} •{" "}
                  {new Date(p.updated_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                </p>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] flex-shrink-0"
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  color: statusMeta[p.status]?.color ?? "#948ea1",
                  backgroundColor: `${statusMeta[p.status]?.color ?? "#948ea1"}18`,
                  border: `1px solid ${statusMeta[p.status]?.color ?? "#948ea1"}30`,
                }}
              >
                {statusMeta[p.status]?.label ?? p.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── AI Activity Feed ──
function AIActivityFeed({ requests }: { requests: GenerationRequest[] }) {
  const statusMeta: Record<string, { icon: string; color: string; filled: boolean }> = {
    queued:     { icon: "schedule",      color: "#948ea1", filled: false },
    processing: { icon: "sync",          color: "#00daf3", filled: false },
    completed:  { icon: "check_circle",  color: "#cdbdff", filled: true  },
    failed:     { icon: "error",         color: "#ffb4ab", filled: true  },
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(28,27,27,0.8)",
        border: "1px solid rgba(0,218,243,0.15)",
        boxShadow: "0 0 30px -12px rgba(0,218,243,0.1)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" filled style={{ color: "#e9c400", fontSize: "18px" }} />
          <h2
            className="text-base font-semibold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            AI Activity
          </h2>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[10px]"
          style={{
            fontFamily: "var(--font-jetbrains)",
            color: "#00daf3",
            backgroundColor: "rgba(0,218,243,0.1)",
            border: "1px solid rgba(0,218,243,0.2)",
          }}
        >
          LIVE
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: "rgba(73,68,85,0.2)" }}
          >
            <Icon name="auto_awesome" style={{ color: "#494455", fontSize: "24px" }} />
          </div>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
          >
            No AI generations yet. Use the Lyric Assistant to get started.
          </p>
        </div>
      ) : (
        <ul>
          {requests.map((r, i) => {
            const meta = statusMeta[r.status] ?? statusMeta.queued;
            return (
              <li
                key={r.id}
                className="flex items-start gap-3 px-5 py-3.5"
                style={{
                  borderBottom: i < requests.length - 1 ? "1px solid rgba(73,68,85,0.12)" : "none",
                }}
              >
                <Icon
                  name={meta.icon}
                  filled={meta.filled}
                  style={{ color: meta.color, fontSize: "18px", flexShrink: 0, marginTop: 2 }}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm text-white leading-snug"
                    style={{ fontFamily: "var(--font-hanken)" }}
                  >
                    {r.prompt.length > 70 ? r.prompt.slice(0, 70) + "…" : r.prompt}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1", fontSize: "11px" }}
                  >
                    {r.type} •{" "}
                    {new Date(r.created_at).toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Quick Actions ──
function QuickActions() {
  const actions = [
    { icon: "auto_awesome",    label: "Lyric Assistant", desc: "Generate gospel lyrics from scripture", href: "/lyric-assistant", color: "#e9c400" },
    { icon: "graphic_eq",      label: "SmartProduce",    desc: "AI mixing and mastering advice",       href: "/smart-produce",    color: "#7c4dff" },
    { icon: "compare_arrows",  label: "Benchmarking",    desc: "Compare against gospel standards",     href: "/music-iq",         color: "#00daf3" },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(28,27,27,0.8)",
        border: "1px solid rgba(73,68,85,0.2)",
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <h2
          className="text-base font-semibold text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Quick Actions
        </h2>
      </div>
      <div className="p-3 space-y-2">
        {actions.map((a) => (
          <Link key={a.label} href={a.href}>
            <div
              className="flex items-center gap-3 p-3.5 rounded-lg cursor-pointer transition-all group"
              style={{ border: "1px solid rgba(73,68,85,0.15)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = `${a.color}35`;
                el.style.backgroundColor = `${a.color}08`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(73,68,85,0.15)";
                el.style.backgroundColor = "transparent";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${a.color}1a` }}
              >
                <Icon name={a.icon} filled style={{ color: a.color, fontSize: "18px" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-white leading-tight"
                  style={{ fontFamily: "var(--font-hanken)" }}
                >
                  {a.label}
                </p>
                <p
                  className="text-xs leading-tight"
                  style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
                >
                  {a.desc}
                </p>
              </div>
              <Icon
                name="chevron_right"
                className="transition-transform duration-150 group-hover:translate-x-0.5 flex-shrink-0"
                style={{ color: "#494455", fontSize: "20px" }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Divine Spark CTA ──
function DivineSpark() {
  return (
    <div
      className="p-5 rounded-xl"
      style={{
        background: "linear-gradient(135deg, rgba(124,77,255,0.18) 0%, rgba(0,218,243,0.08) 100%)",
        border: "1px solid rgba(124,77,255,0.3)",
        boxShadow: "0 0 40px -12px rgba(124,77,255,0.25)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon name="auto_awesome" filled style={{ color: "#e9c400", fontSize: "16px" }} />
        <span
          className="text-xs tracking-widest uppercase"
          style={{ fontFamily: "var(--font-jetbrains)", color: "#e9c400", fontSize: "10px" }}
        >
          Divine Spark
        </span>
      </div>
      <p
        className="text-white mb-1"
        style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 600 }}
      >
        Ready to create?
      </p>
      <p
        className="text-xs mb-4 leading-relaxed"
        style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
      >
        Describe your sound, mood, or a scripture — let the AI compose something divine.
      </p>
      <Link href="/lyric-assistant">
        <button
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}
        >
          Open Lyric Assistant
        </button>
      </Link>
    </div>
  );
}

// ── Loading Skeleton ──
function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
      <div
        className="hidden lg:block w-60 min-h-screen border-r flex-shrink-0"
        style={{ backgroundColor: "#0e0e0e", borderColor: "rgba(73,68,85,0.25)" }}
      />
      <div className="flex-1 flex flex-col">
        <div className="h-20 border-b flex-shrink-0" style={{ borderColor: "rgba(73,68,85,0.25)" }} />
        <div className="flex-1 p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(32,31,31,0.6)" }} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-64 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(32,31,31,0.6)" }} />
            <div className="h-64 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(32,31,31,0.6)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [credits,  setCredits]  = useState<Credits | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.replace("/login"); return; }

      const [p, c, pr, rq] = await Promise.all([
        supabase.from("profiles").select("full_name,email,role,plan,onboarding_complete").eq("id", user.id).single(),
        supabase.from("credits").select("balance,total_used").eq("user_id", user.id).single(),
        supabase.from("projects").select("id,title,genre,status,updated_at").eq("owner_id", user.id).neq("status","deleted").order("updated_at",{ascending:false}).limit(5),
        supabase.from("generation_requests").select("id,prompt,status,type,created_at").eq("user_id", user.id).order("created_at",{ascending:false}).limit(5),
      ]);

      if (p.data)  setProfile(p.data);
      if (c.data)  setCredits(c.data);
      if (pr.data) setProjects(pr.data);
      if (rq.data) setRequests(rq.data);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("gen-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "generation_requests" }, (payload) => {
        if (payload.eventType === "INSERT")
          setRequests(prev => [payload.new as GenerationRequest, ...prev.slice(0, 4)]);
        if (payload.eventType === "UPDATE")
          setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new as GenerationRequest : r));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) return <LoadingSkeleton />;

  const plan = profile?.plan ?? "free";
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Sidebar onSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar profile={profile} />

        <main className="flex-1 p-6 overflow-y-auto">

          {/* Free plan banner */}
          {plan === "free" && (
            <div
              className="mb-6 flex items-center justify-between gap-4 p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(233,196,0,0.06)",
                border: "1px solid rgba(233,196,0,0.2)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon name="workspace_premium" filled style={{ color: "#e9c400", fontSize: "22px", flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-hanken)", color: "#e9c400" }}>
                    You&apos;re on the Free Plan
                  </p>
                  <p className="text-xs" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>
                    Upgrade to unlock unlimited generations and premium studio tools.
                  </p>
                </div>
              </div>
              <Link href="/pricing" className="flex-shrink-0">
                <button
                  className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#e9c400", color: "#221b00", fontFamily: "var(--font-hanken)" }}
                >
                  Upgrade
                </button>
              </Link>
            </div>
          )}

          {/* Stat grid */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard icon="toll"               label="Credit Balance"   value={credits?.balance ?? 0}     sub="Free tier: 10 credits"  accentColor="#e9c400" glowColor="rgba(233,196,0,0.25)"    />
            <StatCard icon="folder_open"         label="Total Projects"   value={projects.length}           sub="Active productions"     accentColor="#cdbdff" glowColor="rgba(124,77,255,0.25)"   />
            <StatCard icon="auto_awesome"        label="AI Generations"   value={credits?.total_used ?? 0}  sub="Tracks & lyrics created" accentColor="#00daf3" glowColor="rgba(0,218,243,0.2)"    />
            <StatCard icon="workspace_premium"   label="Current Plan"     value={planLabel}                 sub="i-Yadah Network"        accentColor="#7c4dff" glowColor="rgba(124,77,255,0.25)"   />
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left 2 cols */}
            <div className="xl:col-span-2 space-y-6">
              <RecentProjects projects={projects} />
              <AIActivityFeed requests={requests} />
            </div>

            {/* Right col */}
            <div className="space-y-4">
              <QuickActions />
              <DivineSpark />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
