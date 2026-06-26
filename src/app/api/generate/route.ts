import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { HfInference } from "@huggingface/inference"; // ✅ Added Hugging Face
import { formatPromptToDisplay } from "@/lib/util";

// Initialize AI SDK clients
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const hf = new HfInference(process.env.HF_ACCESS_TOKEN); // ✅ Added HF client

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function userClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await userClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised. Please log in." }, { status: 401 });
    }

    const body = await req.json();

    const type = body.type || body.tool;
    const { prompt, language = "English", style = "afro-gospel", project_id } = body;

    const formattedPrompt = formatPromptToDisplay(prompt);

    if (!formattedPrompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }
    if (!["lyrics", "music", "mix_advice", "benchmarking"].includes(type)) {
      return NextResponse.json({ error: "Invalid generation type." }, { status: 400 });
    }

    const admin = serviceClient();
    const { data: credit } = await admin
      .from("credits")
      .select("balance, total_used")
      .eq("user_id", user.id)
      .single();

    if (!credit || credit.balance < 1) {
      return NextResponse.json({ error: "Insufficient credits." }, { status: 402 });
    }

    // ── 1. Create a processing request entry ──
    const { data: request, error: insertError } = await admin
      .from("generation_requests")
      .insert({
        user_id: user.id,
        project_id: project_id ?? null,
        type,
        prompt: formattedPrompt,
        model_params: { language, style }, // Combined to prevent table column schema crashes
        status: "processing",
        progress: 10,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !request) {
      return NextResponse.json({ error: "Failed to queue request." }, { status: 500 });
    }

    let resultData: Record<string, string> = {};

    if (type === "lyrics") {
      const systemInstruction = `You are a gifted gospel songwriter with deep knowledge of African Christian music traditions.
Format assignments with clear section labels (VERSE 1, CHORUS, VERSE 2, BRIDGE).
Make the lyrics spiritually authentic, culturally relevant${language !== "English" ? `, and natural in ${language}` : ""}.
Do not add any chat, introductory pleasantries, markdown commentary, or explanations — output ONLY the raw song lyrics text requested.`;

      const userPrompt = `Generate complete, heartfelt gospel song lyrics based on the following rules:
Theme/Scripture: ${formattedPrompt}
Language: ${language}
Musical Style: ${style}

Write lyrics structural design:
- A verse (8 lines)
- A chorus (4-6 lines, repeated feel)
- A second verse (8 lines)  
- Bridge (4 lines, climactic and worshipful)
- Final chorus`;

      try {
        // ── 2. Run text generation using Gemini ──
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.75,
          }
        });

        const lyrics = response.text ?? "";
        resultData = { lyrics };

        // ── 3. Run Hugging Face Audio generation using Gemini's output and original style ──
        try {
          // Take the first few lines of the lyrics or original prompt context to direct the musical instrumentation mood
          const cleanSnippet = lyrics.split("\n").filter(Boolean).slice(1, 3).join(", ");
          const hfPrompt = `Musical style: ${style}. Mood from lyrics: ${cleanSnippet}. Professional premium production quality instrument track.`;

          const hfResponse = await hf.request({
            model: "facebook/musicgen-small",
            inputs: hfPrompt,
          });

          const audioBlob = (hfResponse as unknown) as Blob;
          const buffer = Buffer.from(await audioBlob.arrayBuffer());
          const fileName = `${user.id}-${Date.now()}.wav`;

          // ── 4. Upload raw binary file into your Supabase Public Storage Bucket ──
          const { error: uploadError } = await admin.storage
            .from("generated-music")
            .upload(fileName, buffer, {
              contentType: "audio/wav",
              cacheControl: "3600",
            });

          if (!uploadError) {
            const { data: { publicUrl } } = admin.storage
              .from("generated-music")
              .getPublicUrl(fileName);

            // Append audio path to client response block
            resultData.audioUrl = publicUrl;
          } else {
            console.error("[/api/generate] Audio Storage Upload issue:", uploadError);
          }
        } catch (audioErr) {
          // Non-blocking catch so the user still receives lyrics text if Hugging Face times out
          console.error("[/api/generate] HuggingFace Audio Pipeline exception:", audioErr);
          resultData.audioError = "Audio track could not be generated at this time.";
        }

      } catch (aiErr) {
        console.error("[/api/generate] Gemini Generation Failed:", aiErr);
        await admin.from("generation_requests").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id", request.id);
        return NextResponse.json({ error: "Gemini Engine was unable to process generation rules." }, { status: 500 });
      }
    }

    // ── 5. Update database transaction status to finished ──
    await admin.from("generation_requests").update({
      status: "completed",
      progress: 100,
      result_data: resultData,
      result_url: resultData.audioUrl || null, // Write directly to flat table location if columns exist
      finished_at: new Date().toISOString(),
    }).eq("id", request.id);

    // ── 6. Deduct credit balance ──
    await admin.from("credits").update({
      balance: credit.balance - 1,
      total_used: credit.total_used + 1,
    }).eq("user_id", user.id);

    // ── 7. Log accounting ledger record ──
    await admin.from("credit_transactions").insert({
      user_id: user.id,
      request_id: request.id,
      amount: -1,
      type: "usage",
      description: `${type} generation — "${formattedPrompt.slice(0, 60)}"`,
    });

    return NextResponse.json({
      request_id: request.id,
      type,
      ...resultData,
    });

  } catch (err) {
    console.error("[/api/generate] Absolute Global Catch Block Failure:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}