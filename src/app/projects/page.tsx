"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Sidebar from "@/app/components/Sidebar";

// ── Types ──
interface Project {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  status: "active" | "archived" | "deleted";
  cover_url: string | null;
  created_at: string;
  updated_at: string; 
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
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0", lineHeight: 1, ...style }}
    >
      {name}
    </span>
  );
}

// ── Status config ──
const STATUS_META = {
  active:   { label: "Active",   color: "#cdbdff", bg: "rgba(205,189,255,0.1)",  border: "rgba(205,189,255,0.25)" },
  archived: { label: "Archived", color: "#948ea1", bg: "rgba(148,142,161,0.1)",  border: "rgba(148,142,161,0.25)" },
  deleted:  { label: "Deleted",  color: "#ffb4ab", bg: "rgba(255,180,171,0.1)",  border: "rgba(255,180,171,0.25)" },
} as const;

const GENRE_OPTIONS = [
  "Afro-gospel", "Contemporary Gospel", "Highlife Worship",
  "Gospel Hip-Hop", "Gospel R&B", "Traditional Hymns",
  "Praise & Worship", "Inspirational", "Other",
];

// ── Create Project Modal ──
function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (project: Project) => void;
}) {
  const supabase = createClient();
  const [title, setTitle]       = useState("");
  const [description, setDesc]  = useState("");
  const [genre, setGenre]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  async function handleCreate() {
    if (!title.trim()) { setError("Project title is required."); return; }
    setSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Session expired. Please log in again."); setSaving(false); return; }

    const { data, error: dbError } = await supabase
      .from("projects")
      .insert({
        owner_id:    user.id,
        title:       title.trim(),
        description: description.trim() || null,
        genre:       genre || null,
        status:      "active",
      })
      .select()
      .single();

    if (dbError) { setError(dbError.message); setSaving(false); return; }
    onCreate(data as Project);
    onClose();
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{
          background: "rgba(28,27,27,0.95)",
          border: "1px solid rgba(124,77,255,0.3)",
          boxShadow: "0 0 60px -10px rgba(124,77,255,0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-xl font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              New Project
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
            >
              Start a new divine production
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ color: "#948ea1" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(73,68,85,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Icon name="close" style={{ fontSize: "20px" }} />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label
              className="block text-xs mb-1.5"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}
            >
              PROJECT TITLE *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Praise Him Always"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all"
              style={{
                background: "rgba(73,68,85,0.15)",
                border: "1px solid rgba(73,68,85,0.3)",
                fontFamily: "var(--font-hanken)",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
              maxLength={80}
            />
          </div>

          {/* Genre */}
          <div>
            <label
              className="block text-xs mb-1.5"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}
            >
              GENRE
            </label>
            <select
              value={genre}
              onChange={e => setGenre(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
              style={{
                background: "rgba(73,68,85,0.15)",
                border: "1px solid rgba(73,68,85,0.3)",
                fontFamily: "var(--font-hanken)",
                color: genre ? "#e5e2e1" : "#494455",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
            >
              <option value="" disabled style={{ backgroundColor: "#201f1f" }}>
                Select a genre
              </option>
              {GENRE_OPTIONS.map(g => (
                <option key={g} value={g} style={{ backgroundColor: "#201f1f", color: "#e5e2e1" }}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-xs mb-1.5"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}
            >
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="What is this project about? (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all resize-none"
              style={{
                background: "rgba(73,68,85,0.15)",
                border: "1px solid rgba(73,68,85,0.3)",
                fontFamily: "var(--font-hanken)",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
              maxLength={300}
            />
            <p
              className="text-right text-xs mt-1"
              style={{ fontFamily: "var(--font-jetbrains)", color: "#494455", fontSize: "10px" }}
            >
              {description.length}/300
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{ backgroundColor: "rgba(255,180,171,0.1)", border: "1px solid rgba(255,180,171,0.2)" }}
            >
              <Icon name="error" filled style={{ color: "#ffb4ab", fontSize: "16px" }} />
              <p className="text-xs" style={{ fontFamily: "var(--font-hanken)", color: "#ffb4ab" }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              border: "1px solid rgba(73,68,85,0.3)",
              color: "#cac3d8",
              fontFamily: "var(--font-hanken)",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(73,68,85,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !title.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#7c4dff",
              color: "#fcf6ff",
              fontFamily: "var(--font-hanken)",
            }}
          >
            {saving ? "Creating…" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project Card ──
function ProjectCard({
  project,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  project: Project;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = STATUS_META[project.status];

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: "rgba(28,27,27,0.8)",
        border: "1px solid rgba(73,68,85,0.2)",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(124,77,255,0.25)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(73,68,85,0.2)")}
    >
      {/* Cover / placeholder */}
      <div
        className="h-32 flex items-center justify-center relative"
        style={{
          background: "linear-gradient(135deg, rgba(124,77,255,0.12) 0%, rgba(0,218,243,0.06) 100%)",
          borderBottom: "1px solid rgba(73,68,85,0.15)",
        }}
      >
        {project.cover_url ? (
          <img
            src={project.cover_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon name="music_note" filled style={{ color: "rgba(124,77,255,0.3)", fontSize: "48px" }} />
        )}

        {/* Status badge */}
        <span
          className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-medium"
          style={{
            fontFamily: "var(--font-jetbrains)",
            color: meta.color,
            backgroundColor: meta.bg,
            border: `1px solid ${meta.border}`,
          }}
        >
          {meta.label}
        </span>

        {/* Action menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ backgroundColor: "rgba(19,19,19,0.8)", color: "#cac3d8" }}
          >
            <Icon name="more_vert" style={{ fontSize: "18px" }} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-8 w-40 rounded-xl overflow-hidden z-10 py-1"
              style={{
                background: "rgba(32,31,31,0.97)",
                border: "1px solid rgba(73,68,85,0.3)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              {project.status === "active" && (
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs transition-all text-left"
                  style={{ fontFamily: "var(--font-hanken)", color: "#cac3d8" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(73,68,85,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  onClick={() => { onArchive(project.id); setMenuOpen(false); }}
                >
                  <Icon name="archive" style={{ fontSize: "16px", color: "#948ea1" }} />
                  Archive
                </button>
              )}
              {project.status === "archived" && (
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs transition-all text-left"
                  style={{ fontFamily: "var(--font-hanken)", color: "#cac3d8" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(73,68,85,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  onClick={() => { onUnarchive(project.id); setMenuOpen(false); }}
                >
                  <Icon name="unarchive" style={{ fontSize: "16px", color: "#948ea1" }} />
                  Unarchive
                </button>
              )}
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs transition-all text-left"
                style={{ fontFamily: "var(--font-hanken)", color: "#ffb4ab" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,180,171,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => { onDelete(project.id); setMenuOpen(false); }}
              >
                <Icon name="delete" style={{ fontSize: "16px", color: "#ffb4ab" }} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3
          className="text-sm font-semibold text-white truncate mb-1"
          style={{ fontFamily: "var(--font-hanken)" }}
        >
          {project.title}
        </h3>
        {project.genre && (
          <p
            className="text-xs mb-2 truncate"
            style={{ fontFamily: "var(--font-jetbrains)", color: "#7c4dff", fontSize: "11px" }}
          >
            {project.genre}
          </p>
        )}
        {project.description && (
          <p
            className="text-xs leading-relaxed mb-3 line-clamp-2"
            style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
          >
            {project.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-jetbrains)", color: "#494455", fontSize: "10px" }}
          >
            {new Date(project.updated_at).toLocaleDateString("en-NG", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
          <Link href={`/projects/${project.id}`}>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                fontFamily: "var(--font-hanken)",
                color: "#cdbdff",
                backgroundColor: "rgba(124,77,255,0.1)",
                border: "1px solid rgba(124,77,255,0.2)",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(124,77,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(124,77,255,0.1)")}
            >
              Open
              <Icon name="arrow_forward" style={{ fontSize: "14px" }} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}


// ── Main Page ──
export default function ProjectsPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [projects,     setProjects]     = useState<Project[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [filter,       setFilter]       = useState<"all" | "active" | "archived">("all");
  const [searchQuery,  setSearchQuery]  = useState("");

  const loadProjects = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", user.id)
      .neq("status", "deleted")
      .order("updated_at", { ascending: false });

    setProjects((data as Project[]) ?? []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  async function handleArchive(id: string) {
    await supabase.from("projects").update({ status: "archived" }).eq("id", id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: "archived" } : p));
  }

  async function handleUnarchive(id: string) {
  // Flip the status string safely back to "active"
  await supabase.from("projects").update({ status: "active" }).eq("id", id);
  
  // Instantly update front-end local state for visual parity
  setProjects(prev => prev.map(p => p.id === id ? { ...p, status: "active" } : p));
}

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await supabase.from("projects").update({ status: "deleted" }).eq("id", id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  function handleProjectCreated(project: Project) {
    setProjects(prev => [project, ...prev]);
  }

  // Filter + search
  const visible = projects.filter(p => {
    const matchFilter = filter === "all" ? true : p.status === filter;
    const matchSearch = searchQuery.trim() === ""
      ? true
      : p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.genre ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
      <Sidebar onSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
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
              My Library
            </p>
            <h1
              className="text-xl font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Projects
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}
          >
            <Icon name="add" style={{ fontSize: "18px" }} />
            New Project
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Icon
                name="search"
                style={{ fontSize: "18px", color: "#494455" }}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects by title or genre…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all"
                style={{
                  background: "rgba(28,27,27,0.8)",
                  border: "1px solid rgba(73,68,85,0.25)",
                  fontFamily: "var(--font-hanken)",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.25)")}
              />
            </div>

            {/* Filter pills */}
            <div
              className="flex gap-1 p-1 rounded-xl flex-shrink-0"
              style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.25)" }}
            >
              {(["all", "active", "archived"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    fontFamily: "var(--font-hanken)",
                    backgroundColor: filter === f ? "#7c4dff" : "transparent",
                    color: filter === f ? "#fcf6ff" : "#948ea1",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mb-6">
            {[
              { label: "Total",    value: projects.length,                            color: "#cdbdff" },
              { label: "Active",   value: projects.filter(p=>p.status==="active").length,   color: "#cdbdff" },
              { label: "Archived", value: projects.filter(p=>p.status==="archived").length, color: "#948ea1" },
            ].map(s => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-playfair)", color: s.color }}
                >
                  {s.value}
                </span>
                <span
                  className="text-xs"
                  style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1", fontSize: "10px" }}
                >
                  {s.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-64 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(32,31,31,0.6)" }} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.15)" }}
              >
                <Icon name="folder_open" style={{ color: "#7c4dff", fontSize: "36px" }} />
              </div>
              <h3
                className="text-xl font-semibold text-white mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {searchQuery ? "No projects match your search" : "No projects yet"}
              </h3>
              <p
                className="text-sm mb-8 max-w-sm"
                style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}
              >
                {searchQuery
                  ? "Try a different title or genre."
                  : "Create your first project to start your divine production journey."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}
                >
                  <Icon name="add" style={{ fontSize: "18px" }} />
                  Create First Project
                </button>
              )}
            </div>
          ) : (
            /* Project grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onUnarchive={handleUnarchive}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create modal */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleProjectCreated}
        />
      )}
    </div>
  );
}
