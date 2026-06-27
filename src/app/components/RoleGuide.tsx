"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Profile } from "@/lib/global/types";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ("artiste" | "producer")[];
  fallbackRedirect?: string; // Optional: where to send unauthorized users
  showFallbackMessage?: boolean; // Optional: show a loading/error UI instead of redirecting
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackRedirect = "/dashboard",
  showFallbackMessage = false,
}: RoleGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          router.replace("/login");
          return;
        }

        const userRole = (profile.role as string)?.toLowerCase();
        const hasAccess = allowedRoles.includes(userRole as "artiste" | "producer");

        setIsAuthorized(hasAccess);

        // If not authorized and redirect is expected, push them away
        if (!hasAccess && !showFallbackMessage) {
          router.replace(fallbackRedirect);
        }
      } catch (err) {
        console.error("RoleGuard error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [allowedRoles, fallbackRedirect, showFallbackMessage, router, supabase]);

  // 1. Show a loading state while fetching auth & profile data
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0e0e0e] text-white">
        <div className="text-sm font-medium tracking-wide animate-pulse" style={{ fontFamily: "var(--font-jetbrains)" }}>
          Verifying credentials...
        </div>
      </div>
    );
  }

  // 2. If verified and allowed, render the actual page content
  if (isAuthorized) {
    return <>{children}</>;
  }

  // 3. If explicit fallback UI is requested instead of a hard redirect
  if (showFallbackMessage) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0e0e0e] text-center px-4">
        <h1 className="text-2xl font-bold text-red-400 mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          Access Denied
        </h1>
        <p className="text-sm max-w-md text-[#cac3d8] mb-6" style={{ fontFamily: "var(--font-hanken)" }}>
          Your profile type does not have permission to access this feature.
        </p>
        <button
          onClick={() => router.replace("/dashboard")}
          className="px-4 py-2 text-sm bg-[#7c4dff] text-white rounded-lg transition-all hover:bg-[#693be6]"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Return null if it's currently triggering the redirect sequence
  return null;
}