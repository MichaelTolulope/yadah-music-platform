"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

// Wrapped in Suspense because this checks the session on mount via an
// auth state change listener tied to the recovery token in the URL —
// useSearchParams() isn't used directly here, but Supabase's client
// reads the URL hash itself on mount, and the same Suspense discipline
// established for register/success/page.tsx is followed here for
// consistency and to avoid any build-time surprises.
function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Supabase fires a PASSWORD_RECOVERY event once it parses the
    // recovery token from the URL on page load. Until that happens,
    // there is no valid session to update a password against — so the
    // form stays disabled until this fires, rather than letting someone
    // submit against a session that doesn't actually exist yet.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Fallback: if the user already has a valid recovery session by the
    // time this mounts (e.g. fast navigation), don't leave them stuck.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-white">
          Password Updated
        </h1>
        <p className="font-body-md text-on-surface-variant">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="text-center space-y-4">
        <p className="font-body-md text-on-surface-variant">
          Verifying your reset link…
        </p>
        <p className="text-xs text-on-surface-variant">
          If this doesn't resolve in a few seconds, your link may have
          expired —{" "}
          <Link href="/forgot-password" className="text-primary-fixed underline">
            request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-2 mb-6">
        <h1 className="font-headline-lg text-headline-lg text-white">
          Set a New Password
        </h1>
        <p className="font-body-md text-on-surface-variant">
          Choose a new password for your account.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error mb-6">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="font-label-caps text-label-caps text-outline">
            New Password
          </label>
          <input
            className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
            placeholder="At least 8 characters"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label-caps text-label-caps text-outline">
            Confirm New Password
          </label>
          <input
            className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
            placeholder="Re-enter your new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button
          className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-button text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 max-w-container-max mx-auto bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm">
        <Link
          href="/"
          className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed-dim tracking-tight"
        >
          Zamar.AI
        </Link>
      </header>

      <main className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md px-margin-mobile">
          <div className="glass-panel p-8 md:p-10 rounded-3xl">
            <Suspense fallback={<p className="text-center text-on-surface-variant">Loading…</p>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
