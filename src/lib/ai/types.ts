export interface ToolOption {
  value: string;
  label: string;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  placeholder: string;

  endpoint: string;

  credits: number;
  submitLabel: string;

  resultTitle: string;

  languages: ToolOption[];
  styles: ToolOption[];
  suggestions: string[];
}

export interface AIResult {
  id: string;
  prompt: string;

  language?: string;
  style?: string;

  lyrics: string;

  created_at: string;
}