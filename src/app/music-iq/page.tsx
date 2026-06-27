"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Sidebar from "@/app/components/Sidebar";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

interface AnalysisResult {
    tempo_rhythm: string;
    chords_progression: string;
    eq_frequency_mapping: string;
    mixing_patterns: string;
    producer_directives: string;
}

interface SavedTrack {
    id: string;
    title: string;
    audio_url: string | null;
    lyrics_context?: string | null;
    style_context?: string | null;
}

function Icon({ name, className = "", style, filled = false }: { name: string; className?: string; style?: React.CSSProperties; filled?: boolean }) {
    return (
        <span
            className={`material-symbols-outlined select-none leading-none ${className}`}
            style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0", lineHeight: 1, ...style }}
        >
            {name}
        </span>
    );
}

function MusicIQForm() {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [prompt, setPrompt] = useState("");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [selectedSavedTrack, setSelectedSavedTrack] = useState<SavedTrack | null>(null);

    // UI & Generation State
    const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [generatedSampleUrl, setGeneratedSampleUrl] = useState<string | null>(null);

    useEffect(() => {
        async function loadUserGenerations() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from("generation_requests")
                    .select("id, prompt, result_data, created_at")
                    .eq("user_id", user.id)
                    .eq("status", "completed")
                    .order("created_at", { ascending: false });

                if (!error && data) {
                    const mappedTracks: SavedTrack[] = data.map((req: any) => {
                        const innerData = req.result_data || {};
                        const targetAudio = innerData.audioUrl || innerData.audio_url || innerData.url || innerData.audio || req.result_url || null;

                        let trackingTitle = req.prompt ? `"${req.prompt.trim().slice(0, 30)}..."` : `Draft Concept #${req.id.slice(0, 5)}`;
                        trackingTitle += !targetAudio ? " [Text Only]" : " [Audio]";

                        return {
                            id: req.id,
                            title: trackingTitle,
                            audio_url: targetAudio,
                            lyrics_context: innerData.lyrics || innerData.text || null,
                            style_context: innerData.style || innerData.style_tags || null
                        };
                    });
                    setSavedTracks(mappedTracks);
                }
            } catch (err) {
                console.error("Library query failed:", err);
            }
        }
        loadUserGenerations();
    }, []);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.replace("/");
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedSavedTrack(null); 
            setAudioFile(e.target.files[0]);
        }
    };

    const handleSelectSavedTrack = (trackId: string) => {
        if (!trackId) {
            setSelectedSavedTrack(null);
            return;
        }
        const track = savedTracks.find(t => t.id === trackId);
        if (track) {
            setAudioFile(null); 
            setSelectedSavedTrack(track);

            let autoPrompt = ``;
            if (track.style_context) autoPrompt += `Style environment: ${track.style_context}\n`;
            if (track.lyrics_context) {
                autoPrompt += `Lyrics: \n"${track.lyrics_context.slice(0, 300)}"\n`;
            } else {
                autoPrompt += `Original request context details: ${track.title}`;
            }
            setPrompt(autoPrompt);
        }
    };

    async function handleAnalyze(e: React.FormEvent) {
        e.preventDefault();
        if (!prompt.trim() && !audioFile && !selectedSavedTrack) {
            setError("Please provide data metrics context before submitting.");
            return;
        }

        setAnalyzing(true);
        setError("");
        setResult(null);
        setGeneratedSampleUrl(null);

        try {
            const formData = new FormData();
            if (prompt) formData.append("prompt", prompt);

            if (audioFile) {
                formData.append("audio", audioFile);
            } else if (selectedSavedTrack?.audio_url) {
                formData.append("audioUrl", selectedSavedTrack.audio_url);
            }

            const response = await fetch("/api/music-iq", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed running layout calculus pipeline.");
            }

            setResult(data.analysis);
            if (data.sampleAudioUrl) {
                setGeneratedSampleUrl(data.sampleAudioUrl);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected processing error occurred.");
        } finally {
            setAnalyzing(false);
        }
    }

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: "#131313" }}>
            <Sidebar onSignOut={handleSignOut} />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <header className="p-6 border-b flex-shrink-0" style={{ backgroundColor: "rgba(19,19,19,0.92)", backdropFilter: "blur(20px)", borderColor: "rgba(73,68,85,0.25)" }}>
                    <p className="text-xs mb-0.5" style={{ fontFamily: "var(--font-jetbrains)", color: "#948ea1" }}>Acoustic Intelligence Engine</p>
                    <h1 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Music IQ Consultant</h1>
                </header>

                <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
                    {/* Input Control Box Form Column */}
                    <form onSubmit={handleAnalyze} className="xl:col-span-2 p-5 rounded-xl space-y-5" style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}>
                        <div>
                            <label className="block text-xs mb-1.5 font-bold tracking-wider" style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8" }}>SELECT FROM GENERATION HISTORY</label>
                            <select
                                onChange={(e) => handleSelectSavedTrack(e.target.value)}
                                value={selectedSavedTrack?.id || ""}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer"
                                style={{ background: "rgba(73,68,85,0.15)", border: "1px solid rgba(73,68,85,0.3)", colorScheme: "dark" }}
                            >
                                <option value="" style={{ background: "#1c1b1b" }}>-- Select any track or lyrics concept --</option>
                                {savedTracks.map((track) => (
                                    <option key={track.id} value={track.id} style={{ background: "#1c1b1b" }}>{track.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center my-2 justify-center gap-2 text-gray-600 text-xs font-bold font-jetbrains">
                            <span className="h-px bg-gray-800 flex-1"></span>OR ATTACH REFERENCE FILE<span className="h-px bg-gray-800 flex-1"></span>
                        </div>

                        <div>
                            <input type="file" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            {!audioFile && !selectedSavedTrack?.audio_url ? (
                                <div onClick={() => fileInputRef.current?.click()} className="border border-dashed rounded-xl p-5 text-center cursor-pointer hover:bg-white/5" style={{ borderColor: "rgba(73,68,85,0.4)" }}>
                                    <Icon name="audio_file" style={{ fontSize: "24px", color: "#7c4dff" }} className="mb-1" />
                                    <p className="text-xs text-gray-300 font-medium">Click to attach raw reference audio file</p>
                                </div>
                            ) : (
                                <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.2)" }}>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Icon name="library_music" style={{ color: "#cdbdff" }} />
                                        <p className="text-xs text-gray-200 truncate font-medium">{audioFile ? audioFile.name : `Attached Audio Asset Trace`}</p>
                                    </div>
                                    <button type="button" onClick={() => { setAudioFile(null); setSelectedSavedTrack(null); }} className="text-gray-400 hover:text-red-400"><Icon name="close" style={{ fontSize: "18px" }} /></button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs mb-1.5 font-bold tracking-wider" style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8" }}>CONTEXT DETAILS & LYRICS</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Add mixing layout requests, arrangement notes or descriptive lyrics parameters..."
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none resize-none"
                                style={{ background: "rgba(73,68,85,0.15)", border: "1px solid rgba(73,68,85,0.3)" }}
                            />
                        </div>

                        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

                        <button type="submit" disabled={analyzing} className="w-full py-3 rounded-xl text-sm font-semibold bg-[#7c4dff] text-white disabled:opacity-40">
                            {analyzing ? "Synthesizing Reference Blueprint..." : "Compile Music IQ Profile"}
                        </button>
                    </form>

                    {/* Output Analysis Display Column */}
                    <div className="xl:col-span-3 space-y-4">
                        {/* 🎹 Render Audio Result Dynamic Playback Player Card if populated */}
                        {generatedSampleUrl && (
                            <div className="p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in" style={{ background: "linear-gradient(135deg, rgba(124,77,255,0.15) 0%, rgba(28,27,27,0.9) 100%)", borderColor: "rgba(124,77,255,0.4)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-[#7c4dff]/20"><Icon name="piano" style={{ color: "#cdbdff" }} /></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: "var(--font-jetbrains)" }}>REFINED PIANO HARMONIC COPIER</h4>
                                        <p className="text-xs text-gray-400">Synthesized instrumental reference mock-up based on target progression profiles</p>
                                    </div>
                                </div>
                                <audio src={generatedSampleUrl} controls className="w-full md:w-auto max-w-xs custom-audio-player" style={{ colorScheme: "dark" }} />
                            </div>
                        )}

                        {!result ? (
                            <div className="flex flex-col items-center justify-center py-36 text-center rounded-xl border border-dashed border-gray-800" style={{ background: "rgba(28,27,27,0.3)" }}>
                                <Icon name="analytics" style={{ fontSize: "40px", color: "rgba(73,68,85,0.4)" }} className="mb-2" />
                                <p className="text-sm text-gray-400">Await Blueprint Matrix</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {[
                                    { title: "Tempo & Rhythm Architecture", icon: "metronome", content: result.tempo_rhythm },
                                    { title: "Harmonic Scale & Chord Progressions", icon: "piano", content: result.chords_progression },
                                    { title: "Equalization & Frequency Maps", icon: "graphic_eq", content: result.eq_frequency_mapping },
                                    { title: "Technical Mixing & Signal Routing Patterns", icon: "tune", content: result.mixing_patterns },
                                    { title: "Directives For The Producer", icon: "assignment", content: result.producer_directives, special: true },
                                ].map((section, index) => (
                                    <div key={index} className="p-5 rounded-xl border" style={{ background: "rgba(28,27,27,0.8)", borderColor: section.special ? "rgba(124,77,255,0.3)" : "rgba(73,68,85,0.25)" }}>
                                        <div className="flex items-center gap-2 border-b pb-2 mb-3" style={{ borderColor: "rgba(73,68,85,0.15)" }}>
                                            <Icon name={section.icon} style={{ color: section.special ? "#7c4dff" : "#00daf3", fontSize: "18px" }} />
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wide" style={{ fontFamily: "var(--font-jetbrains)" }}>{section.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-hanken)" }}>{section.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function MusicIQPage() {
    return (
        <Suspense fallback={<div>Loading Component Matrix...</div>}>
            <MusicIQForm />
        </Suspense>
    );
}