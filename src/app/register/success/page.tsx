"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const confirmationRequired = searchParams.get("confirm") === "1";
  const email = searchParams.get("email");

  return (
    <div className="w-full max-w-xl glass-panel p-8 md:p-12 rounded-3xl text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-primary-container/20 flex items-center justify-center">
        <span
          className="material-symbols-outlined text-primary text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {confirmationRequired ? "mark_email_unread" : "verified"}
        </span>
      </div>

      {confirmationRequired ? (
        <>
          <h1 className="font-headline-lg text-headline-lg text-white">
            Check Your Inbox
          </h1>
          <p className="font-body-md text-on-surface-variant">
            We've sent a confirmation link to{" "}
            <span className="text-white font-medium">
              {email ?? "your email address"}
            </span>
            . Click the link to activate your account before signing in —
            this usually arrives within a minute or two.
          </p>
          <p className="font-body-md text-on-surface-variant text-sm">
            Didn't get it? Check your spam folder, or{" "}
            <Link href="/login" className="text-primary-fixed underline">
              try signing in
            </Link>{" "}
            once you've confirmed.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-headline-lg text-headline-lg text-white">
            Divine Account Created
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Welcome to Zamar.AI. Your ministry workspace is ready — 10
            starting credits have been added to your account.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-3 rounded-xl font-button hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Go to Dashboard
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </>
      )}

      <div className="pt-4">
        <Link
          href="/"
          className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-margin-mobile md:px-margin-desktop">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
