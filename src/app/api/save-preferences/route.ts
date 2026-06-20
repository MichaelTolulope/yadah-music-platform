import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This route uses the service role key deliberately — see
// ZAMAR_AI_HANDOFF_v2.md Section 9, gotcha #6: "In API routes
// (server-side), use the SUPABASE_SERVICE_ROLE_KEY to bypass RLS for
// worker operations. Never expose the service role key to the browser."
//
// Why this is needed here specifically: when "Confirm email" is ON,
// supabase.auth.signUp() returns session: null. The browser has no
// valid JWT to attach to the immediately-following artiste_preferences
// insert, so auth.uid() evaluates to NULL inside the RLS policy and
// the insert is rejected — not because the policy is wrong, but
// because the request is effectively unauthenticated at that moment.
// Routing the insert through this server-side route with the service
// role key sidesteps that timing gap entirely.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, primaryGenre, languages, iyadahSite } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid userId." },
        { status: 400 }
      );
    }
    if (!primaryGenre || typeof primaryGenre !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid primaryGenre." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("artiste_preferences")
      .insert({
        user_id: userId,
        primary_genre: primaryGenre,
        languages: Array.isArray(languages) ? languages : [],
        iyadah_site: iyadahSite ?? null,
      });

    if (error) {
      // Surface the real Postgres error message rather than a generic
      // 500 — this is what let us diagnose the RLS issue quickly last
      // time, and the same visibility is worth keeping here.
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
