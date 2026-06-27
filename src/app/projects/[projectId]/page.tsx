"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import Sidebar from "@/app/components/Sidebar";

// ── Types mapping database expectations ──
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

interface GenerationRequest {
    id: string;
    type: "lyrics" | "music" | "mix_advice" | "benchmarking";
    prompt: string;
    status: "processing" | "completed" | "failed";
    result_data: {
        lyrics?: string;
        audioUrl?: string;
        audioError?: string;
    } | null;
    result_url: string | null;
    created_at: string;
}

function Icon({ name, className = "", style, filled = false }: { name: string; className?: string; style?: React.CSSProperties; filled?: boolean }) {
    return (
        <span
            className={`material-symbols-outlined select-none leading-none ${className}`}
            style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0'", lineHeight: 1, ...style }}
        >
            {name}
        </span>
    );
}

interface SingleProjectPageProps {
    params: Promise<{ projectId: string }>;
}

export default function SingleProjectPage({ params }: SingleProjectPageProps) {
    const { projectId } = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [project, setProject] = useState<Project | null>(null);
    const [generations, setGenerations] = useState<GenerationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

    const fetchProjectData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.replace("/login"); return; }

            // 1. Fetch main project profile
            const { data: projectData, error: projErr } = await supabase
                .from("projects")
                .select("*")
                .eq("id", projectId)
                .eq("owner_id", user.id)
                .single();

            // 2. Fetch all saved tracks linked to this project instead of raw requests
            const { data: trackData, error: trackErr } = await supabase
                .from("tracks")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });

            // Map trackData to your UI state array
            setGenerations(
                (trackData?.map(track => ({
                    id: track.id,
                    type: "lyrics",
                    prompt: track.metadata?.inputs?.core_prompt || "Saved Track File",
                    status: "completed",
                    result_url: track.audio_url || track.metadata?.audioUrl || null,
                    result_data: {
                        lyrics: track.metadata?.lyrics,
                        audioUrl: track.audio_url || track.metadata?.audioUrl
                    },
                    created_at: track.created_at
                })) as any) ?? []
            );

            if (projErr || !projectData) {
                console.error("Project fetch error:", projErr);
                router.push("/projects");
                return;
            }

            // 2. Fetch all historical generation requests linked to this project
            const { data: genData } = await supabase
                .from("generation_requests")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });

            setProject(projectData as Project);
            setGenerations((genData as GenerationRequest[]) ?? []);
        } catch (err) {
            console.error("Failed loading layout dependencies:", err);
        } finally {
            setLoading(false);
        }
    }, [projectId, supabase, router]);

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.replace("/");
    }

    const handleDownload = async (url: string, title: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-backing-track.wav`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download failed to parse link stream:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
                <Sidebar onSignOut={handleSignOut} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#7c4dff" }} />
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
            <Sidebar onSignOut={handleSignOut} />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Header Breadcrumb Banner */}
                <header
                    className="p-6 border-b flex-shrink-0 flex items-center justify-between"
                    style={{
                        backgroundColor: "rgba(19,19,19,0.92)",
                        backdropFilter: "blur(20px)",
                        borderColor: "rgba(73,68,85,0.25)",
                    }}
                >
                    <div className="flex items-center gap-4">
                        <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
                            <Icon name="arrow_back" style={{ fontSize: "22px" }} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(124,77,255,0.15)", color: "#cdbdff", fontFamily: "var(--font-jetbrains)" }}>
                                    {project.genre || "Gospel"}
                                </span>
                                <span className="text-xs text-gray-500" style={{ fontFamily: "var(--font-jetbrains)" }}>
                                    Updated {new Date(project.updated_at).toLocaleDateString("en-NG")}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-white mt-1" style={{ fontFamily: "var(--font-playfair)" }}>
                                {project.title}
                            </h1>
                        </div>
                    </div>
                </header>

                {/* Content Body Layout Split */}
                <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Left Column Profile Meta Summary Card */}
                    <div className="lg:col-span-1 p-5 rounded-xl space-y-4" style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}>
                        <div className="h-40 rounded-lg overflow-hidden flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, rgba(124,77,255,0.1) 0%, rgba(0,218,243,0.05) 100%)" }}>
                            {project.cover_url ? (
                                <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover" />
                            ) : (
                                <Icon name="album" filled style={{ color: "rgba(124,77,255,0.25)", fontSize: "64px" }} />
                            )}
                        </div>

                        <div>
                            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-1" style={{ fontFamily: "var(--font-jetbrains)" }}>Description</h3>
                            <p className="text-sm text-gray-300 leading-relaxed" style={{ fontFamily: "var(--font-hanken)" }}>
                                {project.description || "No custom synopsis provided for this dynamic workspace assignment."}
                            </p>
                        </div>
                    </div>

                    {/* Right Columns: Generation Activity Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                            Generated Artifacts ({generations.length})
                        </h2>

                        {generations.length === 0 ? (
                            <div className="text-center py-16 rounded-xl border border-dashed border-gray-800" style={{ background: "rgba(28,27,27,0.4)" }}>
                                <Icon name="library_music" style={{ fontSize: "36px", color: "rgba(73,68,85,0.5)" }} className="mb-3" />
                                <p className="text-sm text-gray-400">No media artifacts generated yet.</p>
                                <p className="text-xs text-gray-600 mt-1">Use tools inside your workspace application to populate tracks.</p>
                            </div>
                        ) : (
                            generations.map((gen) => {
                                const audioLink = gen.result_url || gen.result_data?.audioUrl;

                                return (
                                    <div
                                        key={gen.id}
                                        className="p-5 rounded-xl border transition-all"
                                        style={{
                                            background: "rgba(28,27,27,0.8)",
                                            borderColor: "rgba(73,68,85,0.25)"
                                        }}
                                    >
                                        {/* Element Subheader Meta info */}
                                        <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: "rgba(73,68,85,0.15)" }}>
                                            <div className="flex items-center gap-2">
                                                <Icon name={gen.type === "lyrics" ? "description" : "waveform"} style={{ color: "#00daf3", fontSize: "18px" }} />
                                                <span className="text-xs font-bold text-white uppercase tracking-wide" style={{ fontFamily: "var(--font-jetbrains)" }}>
                                                    {gen.type} Request
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-500" style={{ fontFamily: "var(--font-jetbrains)" }}>
                                                {new Date(gen.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>

                                        {/* Audio Player Attachment row */}
                                        {audioLink && (
                                            <div className="mb-4 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3" style={{ background: "rgba(124,77,255,0.05)", border: "1px solid rgba(124,77,255,0.1)" }}>
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <Icon name="play_circle" filled style={{ color: "#7c4dff" }} />
                                                    <span className="text-xs text-gray-200 font-medium truncate">AI Audio Render Instrument</span>
                                                </div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                    <audio
                                                        src={audioLink}
                                                        controls
                                                        className="h-8 invert opacity-80 brightness-120 w-full sm:w-[240px]"
                                                        onPlay={() => setPlayingAudioId(gen.id)}
                                                        onPause={() => playingAudioId === gen.id && setPlayingAudioId(null)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownload(audioLink, project.title)}
                                                        className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                        title="Download Audio Capture File"
                                                    >
                                                        <Icon name="download" style={{ fontSize: "20px" }} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Prompts block display */}
                                        <div className="mb-3">
                                            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-jetbrains)" }}>Prompt Context</h4>
                                            <p className="text-xs text-gray-400 italic bg-black/20 p-2 rounded">{gen.prompt}</p>
                                        </div>

                                        {/* Body Content display */}
                                        {gen.result_data?.lyrics && (
                                            <div className="mt-4">
                                                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-jetbrains)" }}>Generated Lyrics Output</h4>
                                                <pre className="p-4 rounded-lg text-sm text-gray-200 overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed border" style={{ background: "rgba(19,19,19,0.5)", borderColor: "rgba(73,68,85,0.15)", fontFamily: "var(--font-hanken)" }}>
                                                    {gen.result_data.lyrics}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}