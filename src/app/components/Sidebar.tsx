"use client";
import Link from "next/link";
import { Icon } from "./ai/ui-components";
import { Credits, Profile } from "@/lib/global/types";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";


// ── Nav items — only confirmed Material Symbols names ──
const NAV_ITEMS = [
  { icon: "space_dashboard", label: "Dashboard",      href: "/dashboard",        active: true  },
  { icon: "folder_open",     label: "My Projects",    href: "/projects",         active: false },
  // { icon: "lyrics",          label: "Lyric Assistant",href: "/lyric-assistant",  active: false },
  { icon: "graphic_eq",      label: "Create",   href: "/ai-create",    active: false },
  { icon: "bar_chart",       label: "Music IQ",       href: "/music-iq",         active: false },
  { icon: "calendar_month",  label: "Studio Sessions",href: "/sessions",         active: false },
];


// ── Sidebar ──
 const Sidebar =  ({
  onSignOut,
}: {
  onSignOut: () => void;
}) => {
    

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [credits,  setCredits]  = useState<Credits | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function load(){
             const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.replace("/login"); return; }


        const [p, c] = await Promise.all([
        supabase.from("profiles").select("full_name,email,role,plan,onboarding_complete").eq("id", user.id).single(),
        supabase.from("credits").select("balance,total_used").eq("user_id", user.id).single(),
        ]);

        if (p.data)  setProfile(p.data);
        if (c.data)  setCredits(c.data);
        }

        load();
      // Update active state based on current URL
      const currentPath = window.location.pathname;
        NAV_ITEMS.forEach(item => {
          item.active = item.href === currentPath;
        });
    }, [window.location.pathname]);

  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen border-r flex-shrink-0"
      style={{ backgroundColor: "#0e0e0e", borderColor: "rgba(73,68,85,0.25)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-20 px-5 border-b flex-shrink-0"
        style={{ borderColor: "rgba(73,68,85,0.25)" }}
      >
        <Link href="/">
          <span
            className="text-xl font-bold tracking-tight cursor-pointer"
            style={{ fontFamily: "var(--font-playfair)", color: "#cdbdff" }}
          >
            I-Yadah Music
          </span>
        </Link>
      </div>

      {/* Profile card */}
      <div className="px-4 pt-4">
        <div
          className="p-4 rounded-xl"
          style={{
            background: "rgba(32,31,31,0.7)",
            border: "1px solid rgba(124,77,255,0.25)",
            boxShadow: "0 0 20px -8px rgba(124,77,255,0.3)",
          }}
        >
          {/* Avatar + name row */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
              style={{ backgroundColor: "#7c4dff" }}
            >
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? "Z"}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold text-white leading-tight truncate"
                style={{ fontFamily: "var(--font-hanken)" }}
              >
                {profile?.full_name ?? "…"}
              </p>
              <p
                className="text-xs leading-tight capitalize"
                style={{ fontFamily: "var(--font-jetbrains)", color: "#cdbdff" }}
              >
                {profile?.role ?? "artiste"}
              </p>
            </div>
          </div>

          {/* Credits pill */}
          <div
            className="flex items-center justify-between px-3 py-2 rounded-lg"
            style={{ backgroundColor: "rgba(73,68,85,0.25)" }}
          >
            <div className="flex items-center gap-2">
              <Icon name="toll" className="text-base" style={{ color: "#e9c400", fontSize: "16px" }} filled />
              <span
                className="text-xs"
                style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link key={item.label} href={item.href}>
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: item.active ? "rgba(124,77,255,0.15)" : "transparent",
                border: item.active ? "1px solid rgba(124,77,255,0.3)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!item.active)
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(73,68,85,0.15)";
              }}
              onMouseLeave={(e) => {
                if (!item.active)
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent";
              }}
            >
              <Icon
                name={item.icon}
                filled={item.active}
                style={{
                  color: item.active ? "#cdbdff" : "#948ea1",
                  fontSize: "20px",
                  width: "20px",
                  flexShrink: 0,
                }}
              />
              <span
                className="text-sm truncate"
                style={{
                  fontFamily: "var(--font-hanken)",
                  fontWeight: item.active ? 600 : 400,
                  color: item.active ? "#cdbdff" : "#cac3d8",
                }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left"
          style={{ color: "#948ea1" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(73,68,85,0.2)";
            (e.currentTarget as HTMLButtonElement).style.color = "#e5e2e1";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#948ea1";
          }}
        >
          <Icon name="logout" style={{ fontSize: "20px", width: "20px", flexShrink: 0, color: "inherit" }} />
          <span className="text-sm" style={{ fontFamily: "var(--font-hanken)" }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;