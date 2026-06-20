import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ── Supabase Server Client ──
// Used in Server Components and API Route Handlers (route.ts files)
// Never use this in "use client" components — use supabase-client.ts instead
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies are read-only
            // The middleware handles session refresh so this is safe to ignore
          }
        },
      },
    }
  );
}

// ── Supabase Service Role Client ──
// Bypasses RLS — use ONLY in API routes for worker operations
// (e.g. writing generation results, deducting credits)
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser
export function createServiceRoleClient() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
