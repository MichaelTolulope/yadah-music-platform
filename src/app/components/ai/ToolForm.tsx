"use client";

import { Icon } from "@/app/components/ai/ui-components";
import { ToolConfig } from "@/lib/ai/tools/config";

interface ToolFormProps {
  tool: ToolConfig;

  prompt: string;
  setPrompt: (value: string) => void;

  language: string;
  setLanguage: (value: string) => void;

  style: string;
  setStyle: (value: string) => void;

  generating: boolean;

  error?: string;

  onGenerate: () => void;
}

const LANGUAGES = [
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Pidgin",
  "French",
];

const STYLES = [
  {
    value: "afro-gospel",
    label: "Afro-Gospel",
  },
  {
    value: "contemporary",
    label: "Contemporary Gospel",
  },
  {
    value: "highlife",
    label: "Highlife Worship",
  },
  {
    value: "gospel-hiphop",
    label: "Gospel Hip-Hop",
  },
  {
    value: "hymn",
    label: "Traditional Hymn",
  },
  {
    value: "praise-worship",
    label: "Praise & Worship",
  },
];

export default function ToolForm({
  tool,
  prompt,
  setPrompt,
  language,
  setLanguage,
  style,
  setStyle,
  generating,
  error,
  onGenerate,
}: ToolFormProps) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "rgba(28,27,27,0.8)",
        border: "1px solid rgba(73,68,85,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon
          name="auto_awesome"
          filled
          style={{
            color: "#e9c400",
            fontSize: "20px",
          }}
        />

        <h2
          className="text-base font-semibold text-white"
          style={{
            fontFamily: "var(--font-playfair)",
          }}
        >
          {tool.description}
        </h2>
      </div>

      <div className="mb-4">
        <label
          className="block text-xs mb-1.5"
          style={{
            fontFamily: "var(--font-jetbrains)",
            color: "#cac3d8",
          }}
        >
          PROMPT
        </label>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={tool.placeholder}
          rows={4}
          disabled={generating}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
          style={{
            background: "rgba(73,68,85,0.12)",
            border: "1px solid rgba(73,68,85,0.3)",
            fontFamily: "var(--font-hanken)",
          }}
        />

        <p
          className="text-right text-xs mt-1"
          style={{
            color: "#494455",
          }}
        >
          {prompt.length}/500
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs mb-2 text-[#cac3d8]">
            Language
          </label>

          <div className="flex flex-wrap gap-2">
            {tool.languages?.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className="px-3 py-1 rounded-lg text-xs"
                style={{
                  background:
                    language === lang
                      ? "rgba(0,218,243,0.15)"
                      : "rgba(73,68,85,0.12)",
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs mb-2 text-[#cac3d8]">
            Style
          </label>

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-xl px-3 py-2"
          >
            {tool.styles?.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg p-3 bg-red-900/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      <button
        disabled={generating || !prompt.trim()}
        onClick={onGenerate}
        className="w-full py-3 rounded-xl bg-violet-600 text-white"
      >
        {generating
          ? "Generating..."
          : `${tool.submitLabel} • ${tool.credits} Credit${
              tool.credits > 1 ? "s" : ""
            }`}
      </button>
    </div>
  );
}