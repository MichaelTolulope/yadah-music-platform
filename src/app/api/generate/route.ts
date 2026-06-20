import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// ── Service role client — bypasses RLS for credit deduction ──
function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ── User client — respects RLS ──
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
    // ── 1. Verify auth ──
    const supabase = await userClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised. Please log in." }, { status: 401 });
    }

    // ── 2. Parse request body ──
    const body = await req.json();
    const { type, prompt, language = "English", style = "afro-gospel", project_id } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }
    if (!["lyrics", "music", "mix_advice", "benchmarking"].includes(type)) {
      return NextResponse.json({ error: "Invalid generation type." }, { status: 400 });
    }

    // ── 3. Check credit balance ──
    const admin = serviceClient();
    const { data: credit } = await admin
      .from("credits")
      .select("balance, total_used")
      .eq("user_id", user.id)
      .single();

    if (!credit || credit.balance < 1) {
      return NextResponse.json(
        { error: "Insufficient credits. Please upgrade your plan." },
        { status: 402 }
      );
    }

    // ── 4. Insert generation_requests row (status: queued) ──
    const { data: request, error: insertError } = await admin
      .from("generation_requests")
      .insert({
        user_id:      user.id,
        project_id:   project_id ?? null,
        type,
        prompt:       prompt.trim(),
        language,
        style,
        model_params: { language, style },
        status:       "processing",
        progress:     10,
        started_at:   new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !request) {
      return NextResponse.json({ error: "Failed to queue request." }, { status: 500 });
    }

    // ── 5. Generate content ──
    let resultData: Record<string, string> = {};

    if (type === "lyrics") {
      // Call Claude API (Anthropic) for lyric generation.
      // Explicit timeout added: the long observed durations (15-32s)
      // before failure suggested the request might be hanging rather
      // than failing fast on a config problem. A 25s timeout means we
      // find out which one it is quickly instead of waiting indefinitely.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25_000);

      let aiResponse: Response;
      try {
        aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY!,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `You are a gifted gospel songwriter with deep knowledge of African Christian music traditions.

Generate complete, heartfelt gospel song lyrics based on the following:

Theme/Scripture: ${prompt}
Language: ${language}
Musical Style: ${style}

Write lyrics with:
- A verse (8 lines)
- A chorus (4-6 lines, repeated feel)
- A second verse (8 lines)  
- Bridge (4 lines, climactic and worshipful)
- Final chorus

Format with clear section labels (VERSE 1, CHORUS, VERSE 2, BRIDGE).
Make the lyrics spiritually authentic, culturally relevant${language !== "English" ? `, and natural in ${language}` : ""}.
Do not add any commentary — output only the song lyrics.`,
              },
            ],
          }),
        });
      } catch (fetchErr) {
        clearTimeout(timeout);
        const isAbort = fetchErr instanceof Error && fetchErr.name === "AbortError";
        console.error(
          "[/api/generate] fetch to Anthropic failed",
          isAbort ? "TIMEOUT after 25s" : fetchErr
        );
        await admin.from("generation_requests").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id", request.id);
        return NextResponse.json(
          { error: isAbort ? "AI generation timed out. Please try again." : "AI generation failed. Please try again." },
          { status: 500 }
        );
      }
      clearTimeout(timeout);

      if (!aiResponse.ok) {
        // Anthropic returns a JSON error body describing exactly what
        // went wrong (invalid key, rate limit, billing issue, bad
        // request, etc.) on every non-2xx response. The previous version
        // of this code checked aiResponse.ok and returned a generic
        // error WITHOUT ever reading that body — so the real cause was
        // being discarded before it could reach any log. This is why
        // terminal output showed long request durations and 500s with
        // no [/api/generate] detail: the error was real, it just was
        // never looked at. Reading and logging it now.
        let anthropicError: unknown;
        try {
          anthropicError = await aiResponse.json();
        } catch {
          anthropicError = await aiResponse.text().catch(() => "(could not read error body)");
        }
        console.error(
          "[/api/generate] Anthropic API error",
          aiResponse.status,
          aiResponse.statusText,
          JSON.stringify(anthropicError)
        );

        await admin.from("generation_requests").update({ status: "failed", finished_at: new Date().toISOString() }).eq("id", request.id);
        return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
      }

      const aiData = await aiResponse.json();
      const lyrics = aiData.content?.[0]?.text ?? "";
      resultData = { lyrics };
    }

    // ── 6. Update request to completed ──
    await admin.from("generation_requests").update({
      status:      "completed",
      progress:    100,
      result_data: resultData,
      finished_at: new Date().toISOString(),
    }).eq("id", request.id);

    // ── 7. Deduct 1 credit ──
    // total_used increments the existing count — the previous version of
    // this line computed (balance - balance) + 1, which always evaluated
    // to exactly 1 regardless of how many generations had run before.
    // Fixed to actually accumulate. A speculative RPC call to a
    // "decrement_credit" function was removed from here — its existence
    // was never confirmed, and if it did exist with different logic this
    // would have double-deducted credits silently (the .catch() swallowed
    // any error either way). One explicit update, easy to audit.
    await admin
      .from("credits")
      .update({
        balance:    credit.balance - 1,
        total_used: credit.total_used + 1,
      })
      .eq("user_id", user.id);

    // ── 8. Insert credit transaction log ──
    await admin.from("credit_transactions").insert({
      user_id:    user.id,
      request_id: request.id,
      amount:     -1,
      type:       "usage",
      description: `${type} generation — "${prompt.slice(0, 60)}"`,
    });

    // ── 9. Return result ──
    return NextResponse.json({
      request_id: request.id,
      type,
      ...resultData,
    });

  } catch (err) {
    console.error("[/api/generate]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
