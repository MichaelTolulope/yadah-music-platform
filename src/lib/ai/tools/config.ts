import { AIResult, AITool } from "../types";

export type ToolField =
  | "prompt"
  | "language"
  | "style"
  | "audio"
  | "genre"
  | "tempo";

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string;

  placeholder: string;

  submitLabel: string;

  credits: number;

  fields: ToolField[];

  enabled: boolean;

  languages?: string[];

  styles?: { value: string; label: string }[];

  suggestions?: string[];
}

export const AI_TOOLS: Record<string, AITool> = {
  lyrics: {
    id: "lyrics",
    name: "Lyric Assistant",
    description: "Turn scripture and themes into powerful gospel lyrics",
    placeholder: "e.g. Psalm 23 — The Lord is my shepherd",

    endpoint: "/api/generate",

    credits: 1,
    submitLabel: "Generate Lyrics",
    resultTitle: "Generated Lyrics",

    languages: [
      { value: "English", label: "English" },
      { value: "Yoruba", label: "Yoruba" },
      { value: "Igbo", label: "Igbo" },
      { value: "Hausa", label: "Hausa" },
      { value: "Pidgin", label: "Pidgin" },
      { value: "French", label: "French" },
    ],

    styles: [
      { value: "afro-gospel", label: "Afro-Gospel" },
      { value: "contemporary", label: "Contemporary Gospel" },
      { value: "highlife", label: "Highlife Worship" },
      { value: "gospel-hiphop", label: "Gospel Hip-Hop" },
      { value: "hymn", label: "Traditional Hymn" },
      { value: "praise-worship", label: "Praise & Worship" },
    ],

    suggestions: [
      "Psalm 23 — The Lord is my shepherd",
      "Isaiah 40:31 — They shall mount up with wings",
      "Philippians 4:13 — I can do all things through Christ",
    ],
  },
};