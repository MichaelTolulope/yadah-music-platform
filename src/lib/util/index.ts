
interface FormState {
  prompt: string;
  lyrics: string;
  styles: string;
  options: string;
  title: string;
}

export function formatPromptToDisplay(formData: FormState): string {
  const sections: string[] = [];

  // 1. Handle title specifically if it exists
  if (formData.title.trim()) {
    sections.push(`🎵 Title: "${formData.title.trim()}"`);
  }

  // 2. Main core instruction
  if (formData.prompt.trim()) {
    sections.push(`💡 Core Theme/Scripture:\n"${formData.prompt.trim()}"`);
  }

  // 3. Optional auxiliary text blocks
  if (formData.lyrics.trim()) {
    sections.push(`📝 Baseline Lyrics:\n${formData.lyrics.trim()}`);
  }

  if (formData.styles.trim()) {
    sections.push(`🎸 Custom Styles:\n${formData.styles.trim()}`);
  }

  if (formData.options.trim()) {
    sections.push(`⚙️ Extra Options:\n${formData.options.trim()}`);
  }

  // Join everything cleanly with double newlines for excellent scanability
  return sections.join("\n\n");
}