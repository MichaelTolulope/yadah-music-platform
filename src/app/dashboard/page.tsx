"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

// ── Types ──
interface Profile {
  full_name: string;
  email: string;
  role: string;
  plan: string;
  onboarding_complete: boolean;
}

interface Credits {
  balance: number;
  total_used: number;
}

interface Project {
  id: string;
  title: string;
  genre: string | null;
  status: string;
  updated_at: string;
}

interface GenerationRequest {
  id: string;
  prompt: string;
  status: string;
  type: string;
  created_at: string;
}

// ── Icon helper ──
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
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        ...style,
      }}
    >
      {name}
    </span>
  );
}

// ── Sidebar ──
function Sidebar({
  profile,
  credits,
  onSignOut,
}: {
  profile: Profile | null;
  credits: Credits | null;
  onSignOut: () => void;
}) {
  const navItems = [
    { icon: "dashboard", label: "Dashboard", href: "/dashboard", active: true },
    { icon: "folder_music", label: "My Projects", href: "/projects" },
    { icon: "mic_external_on", label: "Lyric Assistant", href: "/lyric-assistant" },
    { icon: "tune", label: "SmartProduce", href: "/smart-produce" },
    { icon: "analytics", label: "Music IQ", href: "/music-iq" },
    { icon: "calendar_month", label: "Studio Sessions", href: "/sessions" },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col w-64 min-h-screen border-r flex-shrink-0"
      style={{
        backgroundColor: "#0e0e0e",
        borderColor: "rgba(73,68,85,0.2)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-20 px-6 border-b flex-shrink-0"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <Link href="/">
          <span
            className="text-xl font-bold tracking-tight cursor-pointer"
            style={{ fontFamily: "var(--font-playfair)", color: "#cdbdff" }}
          >
            Zamar.AI
          </span>
        </Link>
      </div>

      {/* Profile card */}
      <div
        className="mx-4 mt-4 p-4 rounded-xl"
        style={{
          background: "rgba(32,31,31,0.6)",
          border: "1px solid rgba(124,77,255,0.2)",
          boxShadow: "0 0 20px -8px rgba(124,77,255,0.25)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
            style={{ backgroundColor: "#7c4dff", fontFamily: "var(--font-hanken)" }}
          >
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? "Z"}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-white truncate"
              style={{ fontFamily: "var(--font-hanken)" }}
            >
              {profile?.full_name ?? "Loading…"}
            </p>
            <p
              className="text-xs truncate capitalize"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#cdbdff" }}
            >
              {profile?.role ?? "artiste"}
            </p>
          </div>
        </div>

        {/* Credit balance */}
        <div
          className="flex items-center justify-between p-2 rounded-lg"
          style={{ backgroundColor: "rgba(73,68,85,0.2)" }}
        >
          <div className="flex items-center gap-2">
            <Icon name="toll" className="text-base" style={{ color: "#e9c400" }} filled />
            <span
              className="text-xs"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8" }}
            >
              Credits
            </span>
          </div>
          <span
            className="text-sm font-bold"
            style={{ fontFamily: "var(--font-jetbrains)", color: "#e9c400" }}
          >
            {credits?.balance ?? "—"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group"
              style={{
                backgroundColor: item.active
                  ? "rgba(124,77,255,0.15)"
                  : "transparent",
                border: item.active
                  ? "1px solid rgba(124,77,255,0.3)"
                  : "1px solid transparent",
              }}
            >
              <Icon
                name={item.icon}
                filled={item.active}
                className="text-xl flex-shrink-0"
                style={{ color: item.active ? "#cdbdff" : "#948ea1" }}
              />
              <span
                className="text-sm"
                style={{
                  fontFamily: "var(--font-hanken)",
                  fontWeight: item.active ? 600 : 400,
                  color: item.active ? "#cdbdff" : "#948ea1",
                }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
          style={{ color: "#948ea1" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "rgba(73,68,85,0.2)";
            (e.currentTarget as HTMLButtonElement).style.color = "#e5e2e1";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#948ea1";
          }}
        >
          <Icon name="logout" className="text-xl" />
          <span
            className="text-sm"
            style={{ fontFamily: "var(--font-hanken)" }}
          >
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}

// ── Top Bar ──
function TopBar({ profile }: { profile: Profile | null }) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header
      className="flex items-center justify-between h-20 px-6 border-b flex-shrink-0"
      style={{
        backgroundColor: "rgba(19,19,19,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(73,68,85,0.2)",
      }}
    >
      <div>
        <p
          className="text-xs mb-0.5"
          style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}
        >
          {greeting()},
        </p>
        <h1
          className="text-xl font-semibold text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {profile?.full_name ?? "Welcome back"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg transition-all"
          style={{ color: "#948ea1" }}
          aria-label="Notifications"
        >
          <Icon name="notifications" className="text-xl" />
        </button>
        <Link href="/projects/new">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: "#7c4dff",
              color: "#fcf6ff",
              fontFamily: "var(--font-hanken)",
            }}
          >
            <Icon name="add" className="text-base" />
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
      className="p-5 rounded-xl flex items-start gap-4"
      style={{
        background: "rgba(32,31,31,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: `0 0 30px -10px ${glowColor}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <Icon name={icon} filled className="text-xl" style={{ color: accentColor }} />
      </div>
      <div className="min-w-0">
        <p
          className="text-xs mb-1"
          style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {value}
        </p>
        {sub && (
          <p
            className="text-xs mt-1"
            style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Recent Projects ──
function RecentProjects({ projects }: { projects: Project[] }) {
  const statusColors: Record<string, string> = {
    active: "#cdbdff",
    archived: "#948ea1",
    deleted: "#ffb4ab",
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(32,31,31,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
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
            className="text-xs transition-colors hover:text-purple-300 cursor-pointer"
            style={{ fontFamily: "var(--font-jetbrains)", color: "#7c4dff" }}
          >
            View all →
          </span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <Icon name="folder_music" className="text-5xl mb-4" style={{ color: "#494455" }} />
          <p
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
          >
            No projects yet. Start creating your first divine track.
          </p>
          <Link href="/projects/new">
            <button
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: "#7c4dff",
                color: "#fcf6ff",
                fontFamily: "var(--font-hanken)",
              }}
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
              className="flex items-center gap-4 px-6 py-4 transition-all cursor-pointer"
              style={{
                borderBottom:
                  i < projects.length - 1
                    ? "1px solid rgba(73,68,85,0.15)"
                    : "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLLIElement).style.backgroundColor =
                  "rgba(124,77,255,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLLIElement).style.backgroundColor = "transparent";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(124,77,255,0.15)" }}
              >
                <Icon name="music_note" className="text-base" style={{ color: "#cdbdff" }} filled />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-white truncate"
                  style={{ fontFamily: "var(--font-hanken)" }}
                >
                  {p.title}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}
                >
                  {p.genre ?? "No genre"} •{" "}
                  {new Date(p.updated_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] capitalize flex-shrink-0"
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  color: statusColors[p.status] ?? "#948ea1",
                  backgroundColor: `${statusColors[p.status] ?? "#948ea1"}15`,
                  border: `1px solid ${statusColors[p.status] ?? "#948ea1"}30`,
                }}
              >
                {p.status}
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
  const statusIcon: Record<string, string> = {
    queued: "schedule",
    processing: "sync",
    completed: "check_circle",
    failed: "error",
  };
  const statusColor: Record<string, string> = {
    queued: "#948ea1",
    processing: "#00daf3",
    completed: "#cdbdff",
    failed: "#ffb4ab",
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(32,31,31,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(0,218,243,0.15)",
        boxShadow: "0 0 30px -10px rgba(0,218,243,0.1)",
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" className="text-base" style={{ color: "#e9c400" }} filled />
          <h2
            className="text-base font-semibold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            AI Activity
          </h2>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
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
          <Icon
            name="auto_awesome"
            className="text-4xl mb-3"
            style={{ color: "#494455" }}
          />
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
          >
            No AI generations yet. Use the Lyric Assistant or SmartProduce to get started.
          </p>
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: "rgba(73,68,85,0.15)" }}>
          {requests.map((r) => (
            <li key={r.id} className="px-6 py-4 flex items-start gap-3">
              <Icon
                name={statusIcon[r.status] ?? "help"}
                className="text-lg flex-shrink-0 mt-0.5"
                style={{ color: statusColor[r.status] ?? "#948ea1" }}
                filled={r.status === "completed"}
              />
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm text-white truncate"
                  style={{ fontFamily: "var(--font-hanken)" }}
                >
                  {r.prompt.length > 60
                    ? r.prompt.slice(0, 60) + "…"
                    : r.prompt}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}
                >
                  {r.type} •{" "}
                  {new Date(r.created_at).toLocaleTimeString("en-NG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Quick Actions ──
function QuickActions() {
  const actions = [
    {
      icon: "auto_awesome",
      label: "Lyric Assistant",
      desc: "Generate gospel lyrics from scripture",
      href: "/lyric-assistant",
      color: "#e9c400",
      glow: "rgba(233,196,0,0.2)",
    },
    {
      icon: "tune",
      label: "SmartProduce",
      desc: "AI mixing and mastering advice",
      href: "/smart-produce",
      color: "#7c4dff",
      glow: "rgba(124,77,255,0.2)",
    },
    {
      icon: "compare_arrows",
      label: "Benchmarking",
      desc: "Compare against gospel standards",
      href: "/music-iq",
      color: "#00daf3",
      glow: "rgba(0,218,243,0.2)",
    },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(32,31,31,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <h2
          className="text-base font-semibold text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Quick Actions
        </h2>
      </div>
      <div className="p-4 grid grid-cols-1 gap-3">
        {actions.map((a) => (
          <Link key={a.label} href={a.href}>
            <div
              className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all group"
              style={{
                border: "1px solid rgba(73,68,85,0.2)",
                boxShadow: `0 0 0 0 ${a.glow}`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = `${a.color}40`;
                el.style.boxShadow = `0 0 20px -5px ${a.glow}`;
                el.style.backgroundColor = `${a.color}08`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "rgba(73,68,85,0.2)";
                el.style.boxShadow = `0 0 0 0 ${a.glow}`;
                el.style.backgroundColor = "transparent";
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${a.color}20` }}
              >
                <Icon name={a.icon} className="text-xl" style={{ color: a.color }} filled />
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-hanken)" }}
                >
                  {a.label}
                </p>
                <p
                  className="text-xs"
                  style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
                >
                  {a.desc}
                </p>
              </div>
              <Icon
                name="arrow_forward"
                className="text-base ml-auto flex-shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: "#494455" }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Loading skeleton ──
function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
      <div
        className="hidden lg:block w-64 min-h-screen border-r flex-shrink-0"
        style={{ backgroundColor: "#0e0e0e", borderColor: "rgba(73,68,85,0.2)" }}
      />
      <div className="flex-1 flex flex-col">
        <div
          className="h-20 border-b flex-shrink-0"
          style={{ borderColor: "rgba(73,68,85,0.2)" }}
        />
        <div className="flex-1 p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl animate-pulse"
              style={{ backgroundColor: "rgba(32,31,31,0.6)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ──
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      // ── Check auth ──
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      // ── Fetch profile, credits, projects, recent AI requests in parallel ──
      const [profileRes, creditsRes, projectsRes, requestsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, email, role, plan, onboarding_complete")
            .eq("id", user.id)
            .single(),

          supabase
            .from("credits")
            .select("balance, total_used")
            .eq("user_id", user.id)
            .single(),

          supabase
            .from("projects")
            .select("id, title, genre, status, updated_at")
            .eq("owner_id", user.id)
            .neq("status", "deleted")
            .order("updated_at", { ascending: false })
            .limit(5),

          supabase
            .from("generation_requests")
            .select("id, prompt, status, type, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (creditsRes.data) setCredits(creditsRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (requestsRes.data) setRequests(requestsRes.data);

      setLoading(false);
    }

    loadDashboard();

    // ── Realtime: listen for generation_request status changes ──
    const channel = supabase
      .channel("generation-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "generation_requests",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRequests((prev) => [
              payload.new as GenerationRequest,
              ...prev.slice(0, 4),
            ]);
          }
          if (payload.eventType === "UPDATE") {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === payload.new.id
                  ? (payload.new as GenerationRequest)
                  : r
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) return <LoadingSkeleton />;

  const totalCreditsUsed = credits?.total_used ?? 0;
  const creditBalance = credits?.balance ?? 0;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
      {/* Sidebar */}
      <Sidebar
        profile={profile}
        credits={credits}
        onSignOut={handleSignOut}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar profile={profile} />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Plan badge */}
          {profile?.plan === "free" && (
            <div
              className="mb-6 flex items-center justify-between p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(233,196,0,0.06)",
                border: "1px solid rgba(233,196,0,0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name="workspace_premium"
                  className="text-xl"
                  style={{ color: "#e9c400" }}
                  filled
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ fontFamily: "var(--font-hanken)", color: "#e9c400" }}
                  >
                    You&apos;re on the Free Plan
                  </p>
                  <p
                    className="text-xs"
                    style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
                  >
                    Upgrade to unlock unlimited generations and premium studio tools.
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <button
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 flex-shrink-0"
                  style={{
                    backgroundColor: "#e9c400",
                    color: "#221b00",
                    fontFamily: "var(--font-hanken)",
                  }}
                >
                  Upgrade
                </button>
              </Link>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon="toll"
              label="CREDIT BALANCE"
              value={creditBalance}
              sub="Free tier: 10 credits"
              accentColor="#e9c400"
              glowColor="rgba(233,196,0,0.2)"
            />
            <StatCard
              icon="folder_music"
              label="TOTAL PROJECTS"
              value={projects.length}
              sub="Active productions"
              accentColor="#cdbdff"
              glowColor="rgba(124,77,255,0.2)"
            />
            <StatCard
              icon="auto_awesome"
              label="AI GENERATIONS"
              value={totalCreditsUsed}
              sub="Tracks & lyrics created"
              accentColor="#00daf3"
              glowColor="rgba(0,218,243,0.15)"
            />
            <StatCard
              icon="workspace_premium"
              label="CURRENT PLAN"
              value={
                (profile?.plan?.charAt(0)?.toUpperCase() ?? "") +
                (profile?.plan?.slice(1) ?? "Free")
              }
              sub="i-Yadah Network"
              accentColor="#7c4dff"
              glowColor="rgba(124,77,255,0.2)"
            />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left — projects (takes 2 cols) */}
            <div className="xl:col-span-2 space-y-6">
              <RecentProjects projects={projects} />
              <AIActivityFeed requests={requests} />
            </div>

            {/* Right — quick actions + AI panel */}
            <div className="space-y-6">
              <QuickActions />

              {/* Divine Spark panel */}
              <div
                className="p-6 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,77,255,0.15) 0%, rgba(0,218,243,0.08) 100%)",
                  border: "1px solid rgba(124,77,255,0.25)",
                  boxShadow: "0 0 40px -10px rgba(124,77,255,0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon
                    name="auto_awesome"
                    className="text-lg"
                    style={{ color: "#e9c400" }}
                    filled
                  />
                  <span
                    className="text-xs tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-jetbrains)", color: "#e9c400" }}
                  >
                    Divine Spark
                  </span>
                </div>
                <p
                  className="text-sm text-white mb-1"
                  style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 600 }}
                >
                  Ready to create?
                </p>
                <p
                  className="text-xs mb-4"
                  style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
                >
                  Start with a prompt — describe your sound, mood, or a scripture, and let the AI begin.
                </p>
                <Link href="/lyric-assistant">
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                    style={{
                      backgroundColor: "#7c4dff",
                      color: "#fcf6ff",
                      fontFamily: "var(--font-hanken)",
                    }}
                  >
                    Open Lyric Assistant
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
