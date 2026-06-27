"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IdentityData {
  legalName: string;
  ministryAffiliation: string;
  email: string;
  phone: string;
  password: string;
}

interface ArtisticFocusData {
  primaryGenre: string;
  languages: string[];
}

interface FinalSanctuaryData {
  nearestHub: string;
  agreedToTerms: boolean;
}

const GENRES = ["Afro-gospel", "Highlife Worship", "Contemporary"];
const DEFAULT_LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin"];
const HUBS = [
  "i-Yadah Lagos (Island Hub)",
  "i-Yadah Abuja (Central City)",
  "i-Yadah London (Global Reach)",
  "Remote (Digital Ministry Only)",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [identity, setIdentity] = useState<IdentityData>({
    legalName: "",
    ministryAffiliation: "",
    email: "",
    phone: "",
    password: "",
  });

  const [artisticFocus, setArtisticFocus] = useState<ArtisticFocusData>({
    primaryGenre: "",
    languages: ["English"],
  });

  const [finalSanctuary, setFinalSanctuary] = useState<FinalSanctuaryData>({
    nearestHub: HUBS[0],
    agreedToTerms: false,
  });

  // -- Step 1 validation -----------------------------------------------
  const isStep1Valid =
    identity.legalName.trim().length > 0 &&
    identity.email.trim().length > 0 &&
    identity.phone.trim().length > 0 &&
    identity.password.length >= 8;

  // -- Step 2 validation -----------------------------------------------
  const isStep2Valid = artisticFocus.primaryGenre.length > 0;

  // -- Step 3 validation -----------------------------------------------
  const isStep3Valid = finalSanctuary.agreedToTerms;

  function toggleLanguage(lang: string) {
    setArtisticFocus((prev) => {
      const has = prev.languages.includes(lang);
      return {
        ...prev,
        languages: has
          ? prev.languages.filter((l) => l !== lang)
          : [...prev.languages, lang],
      };
    });
  }

  async function handleFinalSubmit() {
    setErrorMessage(null);

    if (!isStep1Valid) {
      setStep(1);
      setErrorMessage("Please complete your Divine Identity details.");
      return;
    }
    if (!isStep2Valid) {
      setStep(2);
      setErrorMessage("Please select a primary genre.");
      return;
    }
    if (!isStep3Valid) {
      setErrorMessage("Please agree to the Terms of Grace to continue.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();

    try {
      // 1. Create the auth user. The on_auth_user_created trigger will
      //    auto-create a `profiles` row, which in turn triggers a
      //    `credits` row (balance: 10) via on_profile_created.
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: identity.email,
          password: identity.password,
          options: {
            data: {
              full_name: identity.legalName,
              ministry_affiliation: identity.ministryAffiliation || null,
              phone: identity.phone,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        throw new Error(
          "Account created, but no user ID was returned. Please try logging in."
        );
      }

      // This Supabase project has "Confirm email" enabled (Auth settings).
      // signUp() still creates the auth.users row and fires
      // on_auth_user_created (profiles + credits rows exist already),
      // but signUpData.session will be null until the user clicks the
      // confirmation link in their inbox. Track this so the UI can tell
      // the user what's actually happening instead of silently treating
      // them as logged in.
      const emailConfirmationRequired = signUpData.session === null;

      // 2. Insert artiste_preferences via our own API route, not directly
      //    from the browser. Reason: with "Confirm email" ON, signUp()
      //    returns session: null, so the browser has no valid JWT yet for
      //    auth.uid() to resolve correctly inside the RLS policy. Routing
      //    through a server-side route with the service role key avoids
      //    that timing gap entirely. See ZAMAR_AI_HANDOFF_v2.md Section 9
      //    gotcha #6 for why the service role key is safe to use here
      //    (server-only, never exposed to the browser).
      const prefsResponse = await fetch("/api/save-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          primaryGenre: artisticFocus.primaryGenre,
          languages: artisticFocus.languages,
          iyadahSite: finalSanctuary.nearestHub,
        }),
      });

      if (!prefsResponse.ok) {
        const { error: prefsErrorMessage } = await prefsResponse.json();
        // The auth user exists even though preferences failed to save —
        // surface this clearly rather than silently losing the data,
        // since there's currently no automatic retry/rollback path.
        throw new Error(
          `Account created, but preferences could not be saved: ${prefsErrorMessage}`
        );
      }

      router.push(
        emailConfirmationRequired
          ? `/register/success?confirm=1&email=${encodeURIComponent(identity.email)}`
          : "/register/success"
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToStep(target: number) {
    setErrorMessage(null);
    if (target === 2 && !isStep1Valid) {
      setErrorMessage("Please complete your Divine Identity details first.");
      return;
    }
    if (target === 3 && !isStep2Valid) {
      setErrorMessage("Please select a primary genre first.");
      return;
    }
    setStep(target);
  }

  const progressWidth = step === 1 ? "33%" : step === 2 ? "66%" : "100%";

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
            href="/login"
            className="font-button text-button text-on-surface-variant hover:text-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
        <div className="container mx-auto px-margin-mobile md:px-margin-desktop max-w-container-max grid lg:grid-cols-12 gap-gutter items-stretch z-10">
          {/* Left Side: Spiritual Tech Narrative */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-8 pr-12">
            <div className="space-y-4">
              <h1 className="font-display-lg text-display-lg leading-tight text-white">
                Your Ministry, <span className="text-primary italic">Enlightened.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                Step into a sacred digital workspace where divine inspiration
                meets cutting-edge AI. Harmonize your message with tools
                designed specifically for the modern gospel producer.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-xl border-l-4 border-secondary-container">
              <div className="flex gap-4 items-start">
                <span
                  className="material-symbols-outlined text-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <div>
                  <h4 className="font-button text-white mb-1">Lyric Assistant</h4>
                  <p className="font-label-caps text-[11px] text-outline">
                    Powered by Wisdom-Engine
                  </p>
                </div>
              </div>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl gold-border-glow group">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-60" />
              <img
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                alt="A futuristic, high-end music studio with glass panels and purple ambient lighting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ6jAGz2jS3CEfzgeOrg1oovh6CSnKj9VOgF5zdswClezff6poDV9n_5TYGAK697k_ZttEI-srCVV2Kh65cOR1sF_zwsDyAq7mLNq6EuCQbYG_LSVPLC_LUA-RsPfRY81aDANH4rhy65n34tBAEBWyUmescj5BZOnEujhokDMFKhUV0NnrElN5xhnHObFd_eDnKPHZMlKsSFO9kAG3Q3IqRDtv94CrfAhifNegE_7eEArO8iSeF0Jpv0qFg-QWVxmawCxCFlNVmho"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 bg-secondary-container rounded-full pulse-accent" />
                  <span className="font-label-caps text-label-caps text-secondary-container">
                    Live Studio Session
                  </span>
                </div>
                <p className="text-white font-headline-lg text-xl">
                  Lagos Main-Site Active
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Multi-step Onboarding Form */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-2xl glass-panel p-8 md:p-12 rounded-3xl space-y-10 relative">
              {/* Progress Bar */}
              <div className="flex justify-between items-center mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/30 -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-10 transition-all duration-500"
                  style={{ width: progressWidth }}
                />
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className={`z-20 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${dot <= step
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant border border-outline-variant"
                      }`}
                    style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                  >
                    {dot}
                  </div>
                ))}
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">
                  {errorMessage}
                </div>
              )}

              <form
                className="space-y-8"
                onSubmit={(e) => e.preventDefault()}
              >
                {/* Step 1: Identity */}
                {step === 1 && (
                  <section className="step-transition">
                    <div className="mb-6">
                      <h2 className="font-headline-lg text-headline-lg text-white mb-2">
                        Divine Identity
                      </h2>
                      <p className="font-body-md text-on-surface-variant">
                        Tell us about your ministry calling.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-[20px]">
                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-outline">
                          Legal Name
                        </label>
                        <input
                          className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
                          style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                          placeholder="e.g. Minister Enoch"
                          type="text"
                          value={identity.legalName}
                          onChange={(e) =>
                            setIdentity({ ...identity, legalName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-outline">
                          Ministry Affiliation (Optional)
                        </label>
                        <input
                          className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
                          style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                          placeholder="e.g. Redeemed Voices"
                          type="text"
                          value={identity.ministryAffiliation}
                          onChange={(e) =>
                            setIdentity({
                              ...identity,
                              ministryAffiliation: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-outline">
                          Email Address
                        </label>
                        <input
                          className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
                          style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                          placeholder="minister@yadah.ai"
                          type="email"
                          value={identity.email}
                          onChange={(e) =>
                            setIdentity({ ...identity, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-label-caps text-label-caps text-outline">
                          Phone Number
                        </label>
                        <input
                          className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
                          style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                          placeholder="+234..."
                          type="tel"
                          value={identity.phone}
                          onChange={(e) =>
                            setIdentity({ ...identity, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="font-label-caps text-label-caps text-outline">
                          Password
                        </label>
                        <input
                          className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0"
                          style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                          placeholder="At least 8 characters"
                          type="password"
                          value={identity.password}
                          onChange={(e) =>
                            setIdentity({ ...identity, password: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        className="cursor-pointer bg-primary-container text-on-primary-container px-8 py-3 rounded-xl font-button hover:opacity-90 flex items-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                        onClick={() => goToStep(2)}
                        disabled={!isStep1Valid}
                        type="button"
                      >
                        Continue to Artistry
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </section>
                )}

                {/* Step 2: Genre & Language */}
                {step === 2 && (
                  <section className="step-transition">
                    <div className="mb-6">
                      <h2 className="font-headline-lg text-headline-lg text-white mb-2">
                        Artistic Focus
                      </h2>
                      <p className="font-body-md text-on-surface-variant">
                        Select the sounds that define your worship.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="font-label-caps text-label-caps text-outline">
                          Primary Genre
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {GENRES.map((genre) => {
                            const checked = artisticFocus.primaryGenre === genre;
                            return (
                              <label
                                key={genre}
                                className="relative block cursor-pointer group"
                              >
                                <input
                                  className="peer sr-only"
                                  name="genre"
                                  type="radio"
                                  checked={checked}
                                  onChange={() =>
                                    setArtisticFocus({
                                      ...artisticFocus,
                                      primaryGenre: genre,
                                    })
                                  }
                                />
                                <div
                                  className={`p-4 rounded-xl border transition-all text-center ${checked
                                    ? "border-primary-container bg-primary-container/10"
                                    : "border-outline-variant bg-surface-container-low"
                                    }`}
                                >
                                  <span className="font-button text-sm">{genre}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="font-label-caps text-label-caps text-outline">
                          Preferred Lyric Languages
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DEFAULT_LANGUAGES.map((lang) => {
                            const selected = artisticFocus.languages.includes(lang);
                            return (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => toggleLanguage(lang)}
                                className={`px-4 py-2 rounded-full text-xs font-label-caps cursor-pointer transition-colors ${selected
                                  ? "border border-primary-container/50 bg-primary-container/10 text-primary-fixed hover:bg-primary-container/30"
                                  : "border border-outline-variant bg-surface-container text-outline hover:border-primary-container/50"
                                  }`}
                              >
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                      <button
                        className="text-outline hover:text-white font-button transition-colors"
                        onClick={() => goToStep(1)}
                        type="button"
                      >
                        Back
                      </button>
                      <button
                        className="cursor-pointer bg-primary-container text-on-primary-container px-8 py-3 rounded-xl font-button hover:opacity-90 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                        onClick={() => goToStep(3)}
                        disabled={!isStep2Valid}
                        type="button"
                      >
                        Configure Workspace
                        <span className="material-symbols-outlined">settings</span>
                      </button>
                    </div>
                  </section>
                )}

                {/* Step 3: Studio & Finalize */}
                {step === 3 && (
                  <section className="step-transition">
                    <div className="mb-6">
                      <h2 className="font-headline-lg text-headline-lg text-white mb-2">
                        Final Sanctuary
                      </h2>
                      <p className="font-body-md text-on-surface-variant">
                        Connect with your local i-Yadah Studio.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="font-label-caps text-label-caps text-outline">
                          Nearest Hub
                        </label>
                        <select
                          className="w-full bg-surface-container-highest border-outline-variant rounded-lg text-white p-3 divine-spark-focus transition-all focus:ring-0 appearance-none"
                          value={finalSanctuary.nearestHub}
                          onChange={(e) =>
                            setFinalSanctuary({
                              ...finalSanctuary,
                              nearestHub: e.target.value,
                            })
                          }
                        >
                          {HUBS.map((hub) => (
                            <option key={hub} value={hub}>
                              {hub}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-6 rounded-2xl bg-secondary-container/5 border border-secondary-container/20 flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                          <span
                            className="material-symbols-outlined text-on-secondary-container"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified_user
                          </span>
                        </div>
                        <div>
                          <h4 className="font-button text-white">
                            Identity Verification
                          </h4>
                          <p className="font-body-md text-on-surface-variant text-sm mt-1">
                            To access exclusive studio sessions, we require a quick verification of your
                            ministry identity.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          className="rounded border-outline-variant bg-surface-container text-primary-container focus:ring-primary-container"
                          id="terms"
                          type="checkbox"
                          checked={finalSanctuary.agreedToTerms}
                          onChange={(e) =>
                            setFinalSanctuary({
                              ...finalSanctuary,
                              agreedToTerms: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="text-sm text-outline font-body-md"
                          htmlFor="terms"
                        >
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary-fixed underline">
                            Terms of Grace
                          </Link>{" "}
                          and the i-Yadah Network vision.
                        </label>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <button
                        className="cursor-pointer w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-button text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(124,77,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "rgba(73,68,85,0.12)", border: "1px solid rgba(73,68,85,0.3)", fontFamily: "var(--font-hanken)" }}
                        type="button"
                        disabled={!isStep3Valid || isSubmitting}
                        onClick={handleFinalSubmit}
                      >
                        {isSubmitting ? "Creating Account…" : "Create Account & Verify"}
                      </button>
                      <button
                        className=" cursor-pointer w-full text-center text-outline hover:text-white font-button transition-colors py-2"
                        onClick={() => goToStep(2)}
                        type="button"
                      >
                        Go back to genres
                      </button>
                    </div>
                  </section>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter bg-surface-dim dark:bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="flex flex-col items-center md:items-start gap-base">
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Zamar.AI
          </span>
          <p className="font-body-md text-outline text-sm text-center md:text-left">
            © 2026 Zamar.AI • A Ministry of i-Yadah Network
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-gutter">
          <Link
            href="/terms"
            className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors"
          >
            Terms of Grace
          </Link>
          <Link
            href="/privacy"
            className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors"
          >
            Contact Support
          </Link>
          <Link
            href="/affiliations"
            className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors"
          >
            Ministry Affiliations
          </Link>
        </div>
      </footer>
    </>
  );
}
