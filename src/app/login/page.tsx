"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setShowResendOption(false);
    setResendStatus("idle");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase returns a specific message for unconfirmed accounts —
        // "Email not confirmed". This must be caught and handled
        // distinctly, not folded into a generic "invalid credentials"
        // message. A generic message here would send a correctly-
        // registered user down the wrong path (e.g. resetting a
        // password that was never the problem) when the real fix is
        // just clicking the link already sitting in their inbox.
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage(
            "Your email hasn't been confirmed yet. Check your inbox for the confirmation link we sent when you registered."
          );
          setShowResendOption(true);
        } else if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Incorrect email or password. Please try again.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.session) {
        router.push("/dashboard");
      } else {
        // Shouldn't normally happen if there's no error, but guard
        // against silently doing nothing if it does.
        setErrorMessage(
          "Something unexpected happened. Please try signing in again."
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendConfirmation() {
    if (!email.trim()) return;
    setResendStatus("sending");
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      setResendStatus(error ? "error" : "sent");
    } catch {
      setResendStatus("error");
    }
  }

  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 max-w-container-max mx-auto bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm">
        <div className="flex items-center gap-base">
          <Link
            href="/"
            className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed-dim tracking-tight"
          >
            Zamar.AI
          </Link>
        </div>
        <nav className="hidden md:flex gap-gutter items-center">
          <Link
            href="/artistes"
            className="text-on-surface-variant font-medium hover:text-primary dark:hover:text-tertiary transition-colors duration-200"
          >
            Artistes
          </Link>
          <Link
            href="/producers"
            className="text-on-surface-variant font-medium hover:text-primary dark:hover:text-tertiary transition-colors duration-200"
          >
            Producers
          </Link>
          <Link
            href="/ai-tools"
            className="text-on-surface-variant font-medium hover:text-primary dark:hover:text-tertiary transition-colors duration-200"
          >
            AI Tools
          </Link>
        </nav>
        <div className="flex items-center gap-gutter">
          <Link
            href="/register"
            className="bg-primary-container text-on-primary-container font-button text-button px-6 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-md px-margin-mobile">
          <div className="glass-panel p-8 md:p-10 rounded-3xl space-y-8">
            <div className="text-center space-y-2">
              <h1 className="font-headline-lg text-headline-lg text-white">
                Welcome Back
              </h1>
              <p className="font-body-md text-on-surface-variant">
                Sign in to continue your ministry's work.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error space-y-3">
                <p>{errorMessage}</p>
                {showResendOption && (
                  <div>
                    {resendStatus === "sent" ? (
                      <p className="text-on-surface-variant">
                        Confirmation email resent — check your inbox.
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resendStatus === "sending"}
                        className="font-button text-primary-fixed underline hover:opacity-80 transition-opacity disabled:opacity-50"
                      >
                        {resendStatus === "sending"
                          ? "Resending…"
                          : "Resend confirmation email"}
                      </button>
                    )}
                    {resendStatus === "error" && (
                      <p className="text-on-surface-variant text-xs mt-1">
                        Couldn't resend right now. Please try again shortly.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-outline">
                  Email Address
                </label>
                <input
                  className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
                  style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                  placeholder="minister@yadah.ai"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="font-label-caps text-label-caps text-outline">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary-fixed underline hover:opacity-80 transition-opacity"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
                  style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}   
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button
                className="cursor-pointer w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-button text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(124,77,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In…" : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-variant">
              New to Zamar.AI?{" "}
              <Link href="/register" className="text-primary-fixed underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
