import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js"; // Ensure server-side admin client is configured

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize your Supabase Service Role client to upload the newly generated audio sample
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const promptContext = formData.get("prompt") as string || "";
    const audioFile = formData.get("audio") as File | null;
    const audioUrl = formData.get("audioUrl") as string || "";

    let modelContents: any[] = [];
    
    if (audioFile) {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      modelContents.push({ inlineData: { data: audioBuffer.toString("base64"), mimeType: audioFile.type || "audio/wav" } });
    } else if (audioUrl) {
      const response = await fetch(audioUrl);
      if (response.ok) {
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        modelContents.push({ inlineData: { data: audioBuffer.toString("base64"), mimeType: response.headers.get("content-type") || "audio/wav" } });
      }
    }

    // 1. Run the structural music theory analysis with Gemini
    const baseSystemInstructions = `You are an elite master audio engineer. Analyze the parameters and return a strict JSON structure.`;
    modelContents.push({ text: `${baseSystemInstructions}\nUser Context Request: ${promptContext}` });

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: modelContents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            tempo_rhythm: { type: "string" },
            chords_progression: { type: "string" },
            eq_frequency_mapping: { type: "string" },
            mixing_patterns: { type: "string" },
            producer_directives: { type: "string" },
          },
          required: ["tempo_rhythm", "chords_progression", "eq_frequency_mapping", "mixing_patterns", "producer_directives"],
        },
      },
    });

    const parsedOutput = JSON.parse(aiResponse.text || "{}");

    // 2. 🎹 Generate the Refined Piano/Instrumental Sample
    // We send the user's chord suggestions & prompt style into a music generator model
    let generatedAudioPublicUrl = null;
    try {
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/facebook/musicgen-small",
        {
          headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
          method: "POST",
          body: JSON.stringify({ 
            inputs: `A refined, clean solo acoustic piano arrangement playing chord progression, elegant studio mix, style: ${promptContext.slice(0, 100)}` 
          }),
        }
      );

      if (hfResponse.ok) {
        const audioBlobBuffer = await hfResponse.arrayBuffer();
        const fileName = `refined-sample-${Date.now()}.mp3`;

        // Upload sample into your public 'generated-tracks' bucket in Supabase storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from("generated-tracks")
          .upload(fileName, audioBlobBuffer, { contentType: "audio/mp3" });

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from("generated-tracks")
            .getPublicUrl(fileName);
          generatedAudioPublicUrl = urlData.publicUrl;
        }
      }
    } catch (hfErr) {
      console.error("Instrumental compilation skipped or timed out:", hfErr);
      // Fail gracefully so the text analysis is still returned even if the audio engine is busy
    }

    return NextResponse.json({ 
      analysis: parsedOutput,
      sampleAudioUrl: generatedAudioPublicUrl // Send back to the client
    });

  } catch (error: any) {
    console.error("Music IQ Pipeline failure:", error);
    return NextResponse.json({ error: error.message || "Failed processing structures." }, { status: 500 });
  }
}