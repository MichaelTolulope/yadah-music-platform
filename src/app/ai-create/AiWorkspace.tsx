"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { AI_TOOLS } from "@/lib/ai/tools/config";
import ResultCard from "@/app/components/ai/ResultCard";
import History from "@/app/components/ai/History";
import Suggestions from "../components/ai/Suggestions";
import { AIResult } from "@/lib/ai/types";
import { Icon } from "@/app/components/ai/ui-components";
import Sidebar from "@/app/components/Sidebar";
import { formatPromptToDisplay } from "@/lib/util";



// ── Scripture prompt suggestions ──
const SUGGESTIONS = [
  "Psalm 23 — The Lord is my shepherd",
  "Isaiah 40:31 — They shall mount up with wings",
  "Philippians 4:13 — I can do all things through Christ",
  "A song about God's faithfulness in hard times",
  "Worship anthem for Sunday morning service",
  "Prayer song asking for divine direction",
];



// ── Main Page ──
export default function AiWorkspacePage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    prompt: "",
    lyrics: "",
    styles: "",
    options: "",
    title: "",
  });

  const [language, setLanguage] = useState("English");
  const [style, setStyle] = useState("afro-gospel");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<AIResult[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [userId, setUserId] = useState<string>("");

  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Keep your existing state, and add this right below it:
  const [expandedSections, setExpandedSections] = useState({
    lyrics: false,
    styles: false,
    options: false,
  });

  const toggleSection = (section: 'lyrics' | 'styles' | 'options') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };



  const params = useSearchParams();

  const toolId = params.get("tool") ?? "lyrics";

  const selectedTool = AI_TOOLS[toolId] ?? AI_TOOLS.lyrics;

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
          .eq("type", selectedTool.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (credRes.data) setCredits(credRes.data.balance);

      if (histRes.data) {
        const mapped: AIResult[] = histRes.data
          .filter(r => r.result_data?.lyrics)
          .map(r => ({
            id: r.id,
            prompt: r.prompt,
            language: r.model_params?.language ?? "English",
            style: r.model_params?.style ?? "afro-gospel",
            lyrics: r.result_data.lyrics,
            created_at: r.created_at,
          }));
        setHistory(mapped);
      }
    }
    init();
  }, [router, supabase]);

  // Timer effect for recording duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  function handleClear() {
    setForm({ ...form, prompt: "", lyrics: "", styles: "", options: "", title: "" });
    setResult(null);
    setError("");
  }

  async function handleGenerate() {
    if (!form.prompt.trim()) return;
    if (credits !== null && credits < 1) {
      setError("You have no credits remaining. Please upgrade your plan.");
      return;
    }

    setGenerating(true);
    setStreaming(false);
    setError("");
    setResult(null);

    try {
      const res = await fetch(selectedTool.endpoint ?? "/api/generate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          tool: selectedTool.id,

          prompt: form,

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
      const newResult: AIResult = {
        id: data.request_id,
        prompt: formatPromptToDisplay(form),
        language,
        style,
        lyrics: data.lyrics,
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

  async function handleSaveToProject(lyric: AIResult & { audioUrl?: string }) {
    if (!userId) return;
    setError("");

    // 1. Fetch the user's most recent active project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", userId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (projectError || !project) {
      setError("No active project found to save this track to.");
      return;
    }

    // 2. Insert directly into generation_requests so it links to the project view
    const { error: insertError } = await supabase.from("generation_requests").insert({
      project_id: project.id,
      user_id: userId, // or owner_id depending on your schema field
      type: "lyrics",  // or "music" depending on the tool type
      prompt: form.prompt?.trim() || "AI Generated Track Workspace Entry",
      status: "completed",
      result_url: lyric.audioUrl || null,
      result_data: {
        lyrics: lyric.lyrics,
        language: lyric.language,
        style: lyric.style,
        audioUrl: lyric.audioUrl || null
      }
    });

    if (insertError) {
      console.error("Save Error Details:", insertError);
      setError(`Failed to save: ${insertError.message}`);
    } else {
      alert("Saved successfully to your active project feed!");
    }
  }
  
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  // Start Recording Live Voice
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        const file = new File([audioBlob], `recording-${Date.now()}.wav`, { type: "audio/wav" });
        setAudioFile(file);
        setAudioUrl(URL.createObjectURL(audioBlob));

        // Stop all mic tracks to release system device
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or unsupported by browser.");
    }
  }

  // Stop Recording Live Voice
  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }

  // Handle Direct Drag/Drop or Local File Upload Selection
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  }

  // Clear currently captured reference
  function clearAudio() {
    setAudioFile(null);
    setAudioUrl(null);
  }

  return (
    <Suspense>
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
              <h1 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>{selectedTool.name}</h1>
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
                      {selectedTool.description}
                    </h2>
                  </div>

                  {/* Prompt textarea */}
                  <div className="mb-4">
                    <label className="block text-xs mb-1.5" style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}>
                      SCRIPTURE / THEME / MOOD *
                    </label>
                    <textarea
                      value={form.prompt}
                      onChange={e => setForm({ ...form, prompt: e.target.value })}
                      placeholder={selectedTool.placeholder}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all resize-none"
                      style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                      onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
                      disabled={generating}
                      maxLength={500}
                    />
                    {/* ── Collapsible: Lyrics ── */}
                    <div className="mb-4 rounded-xl border border-[rgba(73,68,85,0.2)] bg-[rgba(73,68,85,0.05)] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('lyrics')}
                        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[#cac3d8] tracking-wider transition-colors hover:bg-[rgba(73,68,85,0.1)]"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="history_edu" style={{ fontSize: "16px", color: expandedSections.lyrics ? "#7c4dff" : "#948ea1" }} />
                          LYRICS {form.lyrics ? "•" : ""}
                        </span>
                        <Icon
                          name={expandedSections.lyrics ? "expand_less" : "expand_more"}
                          style={{ fontSize: "18px", color: "#948ea1" }}
                        />
                      </button>

                      {expandedSections.lyrics && (
                        <div className="px-4 pb-4 pt-1 border-t border-[rgba(73,68,85,0.15)] bg-[rgba(19,19,19,0.4)]">
                          <textarea
                            value={form.lyrics}
                            onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
                            rows={5}
                            placeholder="Paste baseline lyrics or ideas here..."
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all resize-none"
                            style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                            onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
                            onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
                            disabled={generating}
                            maxLength={500}
                          />
                          <p className="text-right text-xs mt-1" style={{ fontFamily: "var(--font-jetbrains)", color: "#494455", fontSize: "10px" }}>
                            {form.lyrics.length}/500
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ── Collapsible: Styles ── */}
                    <div className="mb-4 rounded-xl border border-[rgba(73,68,85,0.2)] bg-[rgba(73,68,85,0.05)] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('styles')}
                        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[#cac3d8] tracking-wider transition-colors hover:bg-[rgba(73,68,85,0.1)]"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="music_note" style={{ fontSize: "16px", color: expandedSections.styles ? "#7c4dff" : "#948ea1" }} />
                          CUSTOM STYLES {form.styles ? "•" : ""}
                        </span>
                        <Icon
                          name={expandedSections.styles ? "expand_less" : "expand_more"}
                          style={{ fontSize: "18px", color: "#948ea1" }}
                        />
                      </button>

                      {expandedSections.styles && (
                        <div className="px-4 pb-4 pt-1 border-t border-[rgba(73,68,85,0.15)] bg-[rgba(19,19,19,0.4)]">
                          <textarea
                            value={form.styles}
                            onChange={(e) => setForm({ ...form, styles: e.target.value })}
                            rows={3}
                            placeholder="e.g., call and response, traditional arrangements, rhythmic percussion..."
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all resize-none"
                            style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                            onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
                            onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
                            disabled={generating}
                            maxLength={500}
                          />
                          <p className="text-right text-xs mt-1" style={{ fontFamily: "var(--font-jetbrains)", color: "#494455", fontSize: "10px" }}>
                            {form.styles.length}/500
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ── Collapsible: More Options ── */}
                    <div className="mb-4 rounded-xl border border-[rgba(73,68,85,0.2)] bg-[rgba(73,68,85,0.05)] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection('options')}
                        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[#cac3d8] tracking-wider transition-colors hover:bg-[rgba(73,68,85,0.1)]"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="tune" style={{ fontSize: "16px", color: expandedSections.options ? "#7c4dff" : "#948ea1" }} />
                          MORE OPTIONS
                        </span>
                        <Icon
                          name={expandedSections.options ? "expand_less" : "expand_more"}
                          style={{ fontSize: "18px", color: "#948ea1" }}
                        />
                      </button>

                      {expandedSections.options && (
                        <div className="px-4 pb-4 pt-1 border-t border-[rgba(73,68,85,0.15)] bg-[rgba(19,19,19,0.4)]">
                          <textarea
                            value={form.options}
                            onChange={(e) => setForm({ ...form, options: e.target.value })}
                            rows={3}
                            placeholder="Additional generation parameters, structural targets..."
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all resize-none"
                            style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                            onFocus={e => (e.target.style.borderColor = "rgba(124,77,255,0.5)")}
                            onBlur={e => (e.target.style.borderColor = "rgba(73,68,85,0.3)")}
                            disabled={generating}
                            maxLength={500}
                          />
                        </div>
                      )}
                    </div>
                    {/* ── AUDIO INPUT COMPONENT BLOCK ── */}
                    <div className="mb-5">
                      <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        Audio Reference / Vocal Hum (optional)
                      </label>

                      <div
                        className="p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all"
                        style={{
                          background: "rgba(73,68,85,0.08)",
                          border: isRecording ? "1px dashed #00daf3" : "1px solid rgba(73,68,85,0.25)"
                        }}
                      >
                        {/* Left Interaction Panel */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          {isRecording ? (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center animate-pulse shrink-0 transition-transform active:scale-95"
                            >
                              <span className="material-symbols-outlined font-filled">stop</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={startRecording}
                              disabled={!!audioFile}
                              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
                              style={{ backgroundColor: "rgba(0, 218, 243, 0.15)", color: "#00daf3" }}
                            >
                              <span className="material-symbols-outlined font-filled">mic</span>
                            </button>
                          )}

                          {/* Dynamic Status / File Indicator Text */}
                          <div className=" min-w-0">
                            {isRecording ? (
                              <div>
                                <p className="text-sm font-semibold text-[#00daf3]">Recording Voice...</p>
                                <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-jetbrains)" }}>
                                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                                </p>
                              </div>
                            ) : audioFile ? (
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate max-w-[200px] md:max-w-[300px]">
                                  📎 {audioFile.name}
                                </p>
                                <p className="text-xs text-gray-500">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-medium text-white">Record voice melody or upload reference</p>
                                <p className="text-xs text-gray-500">Sing a motif, upload WAV, MP3, or M4A</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Action Panel (Upload trigger or Mini-Player View) */}
                        <div className="flex flex-1 items-center gap-2 w-full md:w-auto justify-end">
                          {audioUrl ? (
                            <div className="flex items-center gap-3 w-full justify-between bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                              <audio src={audioUrl} controls className="h-7 w-full inventory-audio-player invert opacity-80" />
                              <button
                                type="button"
                                onClick={clearAudio}
                                className="text-gray-400 hover:text-red-400 p-1 transition-colors flex items-center"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          ) : (
                            <label
                              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border border-dashed hover:bg-white/5 active:scale-95 text-gray-300"
                              style={{ borderColor: "rgba(73,68,85,0.4)", fontFamily: "var(--font-hanken)" }}
                            >
                              <span className="material-symbols-outlined text-[16px]">upload_file</span>
                              Upload File
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="flex gap-4">
                      <div className="mb-4">
                        <label className="text-xs text-gray-400">SONG TITLE (optional)</label>
                        <input
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#494455] outline-none transition-all resize-none"
                          style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}

                        />
                      </div>



                    </div>

                  </div>

                  {/* Language + Style row */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ fontFamily: "var(--font-jetbrains)", color: "#cac3d8", fontSize: "11px" }}>LANGUAGE</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTool.languages.map(l => (
                          <button
                            key={l.value}
                            onClick={() => setLanguage(l.value)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              fontFamily: "var(--font-hanken)",
                              backgroundColor: language === l.value ? "rgba(0,218,243,0.15)" : "rgba(73,68,85,0.12)",
                              color: language === l.value ? "#00daf3" : "#948ea1",
                              border: `1px solid ${language === l.value ? "rgba(0,218,243,0.3)" : "rgba(73,68,85,0.2)"}`,
                            }}
                          >
                            {l.label}
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
                        {selectedTool.styles?.map((s) => (
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

                  <div className="flex items-center gap-3">
                    {form.prompt.trim() && (
                      <button
                        onClick={handleClear}
                        type="button"
                        className="h-[52px] w-[52px] rounded-xl flex items-center justify-center transition-all hover:bg-red-500/10"
                        style={{
                          border: "1px solid rgba(255,80,80,0.2)",
                          color: "#ff7b7b",
                        }}
                      >
                        <Icon
                          name="delete"
                          style={{ fontSize: "22px" }}
                        />
                      </button>
                    )}
                    {/* Generate button */}
                    <button
                      onClick={handleGenerate}
                      disabled={generating || !form.prompt.trim()}
                      className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ backgroundColor: "#7c4dff", color: "#fcf6ff", fontFamily: "var(--font-hanken)" }}
                    >
                      {generating ? (
                        <>
                          <Icon name="sync" className="animate-spin" style={{ fontSize: "18px" }} />
                          {"Generating…"}
                        </>
                      ) : (
                        <>
                          <Icon name="auto_awesome" filled style={{ fontSize: "18px" }} />
                          {selectedTool.submitLabel || "Generate Lyrics"} — {selectedTool.credits} Credit{selectedTool.credits !== 1 ? "s" : ""}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Result */}
                {result && (
                  <ResultCard
                    toolName={selectedTool.name}
                    result={result}
                    streaming={streaming}
                    onReset={() => {
                      setResult(null);
                      setForm({ ...form, prompt: "" });
                    }}
                    onSave={() => handleSaveToProject(result)}
                  />
                )}
              </div>

              {/* ── Right: suggestions + history ── */}
              <div className="space-y-5">

                {/* Prompt suggestions */}
                <Suggestions
                  suggestions={selectedTool.suggestions || SUGGESTIONS}
                  onSelect={(suggestion) => setForm({ ...form, prompt: suggestion })}
                />

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
                  <History
                    history={history}
                    onSelect={(item) => {
                      setResult(item)
                      setForm({ ...form, prompt: item.prompt })
                      setStreaming(false)
                    }}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}
