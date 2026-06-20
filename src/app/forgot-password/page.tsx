"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      // redirectTo must point at the page that handles the actual
      // password update — see src/app/reset-password/page.tsx.
      // Supabase appends the recovery token to this URL automatically.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      // Always show the same success state regardless of whether the
      // email actually exists in the system — confirming or denying
      // account existence here would let someone enumerate registered
      // emails. Supabase itself follows this pattern by design.
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
          <div className="glass-panel p-8 md:p-10 rounded-3xl space-y-8">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    mark_email_unread
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-white">
                  Check Your Inbox
                </h1>
                <p className="font-body-md text-on-surface-variant">
                  If an account exists for <span className="text-white">{email}</span>,
                  we've sent a link to reset your password.
                </p>
                <Link
                  href="/login"
                  className="inline-block text-primary-fixed underline font-button"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <h1 className="font-headline-lg text-headline-lg text-white">
                    Reset Your Password
                  </h1>
                  <p className="font-body-md text-on-surface-variant">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">
                    {error}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label className="font-label-caps text-label-caps text-outline">
                      Email Address
                    </label>
                    <input
                      className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
                      placeholder="minister@yadah.ai"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <button
                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-button text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>

                <p className="text-center text-sm text-on-surface-variant">
                  <Link href="/login" className="text-primary-fixed underline">
                    Back to Sign In
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
