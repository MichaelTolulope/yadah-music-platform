import { AIResult } from "@/lib/ai/types";
import { CopyButton, Icon, StreamingText } from "./ui-components";

// Extend your local interface if result type doesn't explicitly expose audioUrl yet
interface ExtendedAIResult extends AIResult {
  audioUrl?: string;
}

interface ResultCardProps {
  toolName: string;
  result: ExtendedAIResult;
  streaming: boolean;
  onReset: () => void;
  onSave: () => void;
}

function ResultCard({
  toolName,
  result,
  streaming,
  onReset,
  onSave,
}: ResultCardProps) {
  
  // Dynamic handling for forcing a file download binary transfer stream
  const handleDownload = async () => {
    if (!result.audioUrl) return;
    try {
      const response = await fetch(result.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generation-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download execution interrupted:", err);
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(28,27,27,0.8)",
        border: "1px solid rgba(124,77,255,0.25)",
        boxShadow: "0 0 40px -12px rgba(124,77,255,0.2)",
      }}
    >
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Icon
            name="auto_awesome"
            filled
            style={{ color: "#e9c400", fontSize: "18px" }}
          />
          <span
            className="text-sm font-semibold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Generated {toolName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px]"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: "#00daf3",
              backgroundColor: "rgba(0,218,243,0.1)",
              border: "1px solid rgba(0,218,243,0.2)",
            }}
          >
            {result.language || "English"}
          </span>

          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] capitalize"
            style={{
              fontFamily: "var(--font-jetbrains)",
              color: "#cdbdff",
              backgroundColor: "rgba(124,77,255,0.1)",
              border: "1px solid rgba(124,77,255,0.2)",
            }}
          >
            {result.style?.replace("-", " ") || "Gospel"}
          </span>

          <CopyButton text={result.lyrics} />
        </div>
      </div>

      {/* ── AUDIO PLAYER LAYER (Conditionally rendered if media exists) ── */}
      {result.audioUrl && !streaming && (
        <div 
          className="mx-5 mt-5 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ 
            background: "rgba(124,77,255,0.06)", 
            border: "1px solid rgba(124,77,255,0.15)" 
          }}
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(0, 218, 243, 0.1)" }}
            >
              <Icon name="music_note" filled style={{ color: "#00daf3", fontSize: "20px" }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">AI Backing Track Reference</p>
              <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-jetbrains)" }}>Generated via MusicGen</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <audio 
              src={result.audioUrl} 
              controls 
              className="h-8 w-full sm:w-[220px] invert opacity-85 brightness-150 rounded-md" 
            />
            <button
              type="button"
              onClick={handleDownload}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
              title="Download Audio File"
            >
              <Icon name="download" style={{ fontSize: "18px" }} />
            </button>
          </div>
        </div>
      )}

      {/* BODY (LYRICS DISPLAY) */}
      <div className="px-5 py-5">
        {streaming ? (
          <StreamingText text={result.lyrics} />
        ) : (
          <pre
            className="whitespace-pre-wrap text-sm leading-loose max-h-[450px] overflow-y-auto pr-2 custom-scrollbar"
            style={{
              fontFamily: "var(--font-hanken)",
              color: "#e5e2e1",
            }}
          >
            {result.lyrics}
          </pre>
        )}
      </div>

      {/* FOOTER */}
      <div
        className="flex items-center justify-between px-5 py-4 border-t"
        style={{ borderColor: "rgba(73,68,85,0.2)" }}
      >
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
          style={{
            fontFamily: "var(--font-hanken)",
            color: "#948ea1",
          }}
        >
          <Icon name="refresh" style={{ fontSize: "14px" }} />
          Start over
        </button>

        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: "#7c4dff",
            color: "#fcf6ff",
            fontFamily: "var(--font-hanken)",
          }}
        >
          <Icon name="save" style={{ fontSize: "14px" }} />
          Save to Project
        </button>
      </div>
    </div>
  );
}

export default ResultCard;