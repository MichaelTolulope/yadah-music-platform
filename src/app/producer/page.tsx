'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  plan: string;
}

interface Credits {
  balance: number;
  total_used: number;
}

interface StudioSession {
  id: string;
  title: string;
  notes: string | null;
  scheduled_at: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location: string | null;
  artiste_id: string | null;
  // Joined artiste name via profiles
  artiste?: { full_name: string | null } | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function formatSessionTime(isoString: string): { time: string; period: string } {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return {
    time: `${displayHour.toString().padStart(2, '0')}:${minutes}`,
    period,
  };
}

function getStatusBadge(status: StudioSession['status']): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'in_progress':
      return {
        label: 'LIVE SESSION',
        className: 'bg-secondary-container/10 text-secondary-fixed-dim',
      };
    case 'scheduled':
      return {
        label: 'SCHEDULED',
        className: 'bg-primary-container/10 text-primary',
      };
    case 'completed':
      return {
        label: 'COMPLETED',
        className: 'bg-surface-variant text-outline',
      };
    case 'cancelled':
      return {
        label: 'CANCELLED',
        className: 'bg-error-container/20 text-error',
      };
  }
}


function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Shalom';
  if (hour < 17) return 'Shalom';
  return 'Shalom';
}

// ── Nav Link ───────────────────────────────────────────────────────────────────

function NavLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  if (active) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3 bg-primary-container/20 text-primary border-r-4 border-primary rounded-r-lg transition-all active:scale-95"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
        <span className="font-label-caps text-label-caps">{label}</span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 transition-all rounded-lg"
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-label-caps text-label-caps">{label}</span>
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ProducerPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [todaySessions, setTodaySessions] = useState<StudioSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionView, setSessionView] = useState<'today' | 'week'>('today');

  // Lyric assistant textarea state (navigates to /producer/lyric-assistant on submit)
  const [lyricPrompt, setLyricPrompt] = useState('');

  // Genre benchmarking dropdown
  const [selectedGenre, setSelectedGenre] = useState('Afro-Gospel (High Energy)');

  useEffect(() => {
    async function loadData() {
      // Auth guard
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace('/login');
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, plan')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        router.replace('/login');
        return;
      }

      setProfile(profileData);

      // Load credits
      const { data: creditsData } = await supabase
        .from('credits')
        .select('balance, total_used')
        .eq('user_id', user.id)
        .single();

      if (creditsData) setCredits(creditsData);

      // Load today's studio sessions for this producer
      // Uses real schema columns: producer_id, scheduled_at, title, notes, status, location, artiste_id
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const { data: sessionsData } = await supabase
        .from('studio_sessions')
        .select(`
          id,
          title,
          notes,
          scheduled_at,
          status,
          location,
          artiste_id,
          artiste:profiles!studio_sessions_artiste_id_fkey(full_name)
        `)
        .eq('producer_id', user.id)
        .gte('scheduled_at', todayStart.toISOString())
        .lte('scheduled_at', todayEnd.toISOString())
        .order('scheduled_at', { ascending: true });

      if (sessionsData) setTodaySessions(sessionsData as StudioSession[]);

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  function handleLyricSubmit() {
    if (!lyricPrompt.trim()) return;
    // Pass the prompt as a query param to the lyric assistant page
    router.push(
      `/producer/lyric-assistant?prompt=${encodeURIComponent(lyricPrompt)}`
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center space-y-4">
          <span
            className="material-symbols-outlined text-primary text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <p className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Producer';

  return (
    <div className="bg-surface-dim text-on-surface font-body-md min-h-screen">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/30 py-base z-50 custom-scrollbar overflow-y-auto">
        {/* Brand */}
        <div className="px-6 mb-10">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
            Zamar.AI
          </h1>
          <p className="font-label-caps text-label-caps text-outline mt-1 uppercase tracking-widest">
            Enlightened Tech
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2">
          <NavLink href="/producer" icon="dashboard" label="Dashboard" active />
          <NavLink href="/producer/lyric-assistant" icon="auto_awesome" label="Lyric Assistant" />
          <NavLink href="/producer/smart-produce" icon="equalizer" label="SmartProduce" />
          <NavLink href="/producer/music-iq" icon="analytics" label="Music IQ" />
          <NavLink href="/producer/sessions" icon="event" label="Studio Sessions" />
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto px-4 pb-8 space-y-4">
          <Link
            href="/producer/sessions/new"
            className="w-full bg-primary-container text-on-primary-container font-button text-button py-3 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            Start New Session
          </Link>

          <div className="pt-4 border-t border-outline-variant/20">
            <Link
              href="/producer/settings"
              className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-caps text-label-caps uppercase">Settings</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors w-full text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-caps text-label-caps uppercase">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Canvas ─────────────────────────────────────────────────────── */}
      <main className="lg:ml-64 min-h-screen p-4 md:p-10 overflow-x-hidden pb-24 lg:pb-10">

        {/* Top bar */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Studio Workspace
            </h2>
            <p className="text-outline font-body-md">
              {getGreeting()}, {firstName}. Here&apos;s your workflow for today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline text-lg">search</span>
              <input
                type="text"
                placeholder="Search sessions..."
                className="bg-transparent border-none focus:ring-0 text-body-md w-48 text-on-surface placeholder:text-outline"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary-fixed-dim rounded-full" />
            </button>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-container-high flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_circle
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ── Bento Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Daily Schedule ── col-span-8 */}
          <section className="md:col-span-8 bg-surface-container rounded-xl p-6 border border-outline-variant/10"
            style={{ boxShadow: '0 0 20px rgba(124,77,255,0.15)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                Daily Schedule
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSessionView('today')}
                  className={`px-3 py-1 rounded-lg text-label-caps text-[12px] transition-colors ${
                    sessionView === 'today'
                      ? 'bg-surface-variant text-on-surface'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setSessionView('week')}
                  className={`px-3 py-1 rounded-lg text-label-caps text-[12px] transition-colors ${
                    sessionView === 'week'
                      ? 'bg-surface-variant text-on-surface'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {todaySessions.length === 0 ? (
                // Empty state — per design principle: invitation to act, not mood
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-outline text-4xl mb-3">
                    event_available
                  </span>
                  <p className="font-body-md text-outline">No sessions scheduled for today.</p>
                  <Link
                    href="/producer/sessions/new"
                    className="mt-4 px-4 py-2 bg-primary-container/20 text-primary rounded-lg font-button text-button hover:bg-primary-container/30 transition-colors"
                  >
                    Schedule a session
                  </Link>
                </div>
              ) : (
                todaySessions.map((session) => {
                  const { time, period } = formatSessionTime(session.scheduled_at);
                  const badge = getStatusBadge(session.status);
                  const artisteName =
                    session.artiste?.full_name ??
                    session.notes?.split('•')[0]?.trim() ??
                    'Session';
                  const taskDetail =
                    session.notes ??
                    (session.location ? `@ ${session.location}` : '');

                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{
                        background: 'rgba(32,31,31,0.4)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderLeft: `4px solid ${
                          session.status === 'in_progress'
                            ? '#e9c400'
                            : session.status === 'scheduled'
                            ? '#cdbdff'
                            : session.status === 'completed'
                            ? '#948ea1'
                            : '#ffb4ab'
                        }`,
                      }}
                    >
                      <div className="flex items-center gap-4 w-full">
                        {/* Time */}
                        <div className="text-center min-w-[60px]">
                          <p className="font-label-caps text-label-caps text-outline">{time}</p>
                          <p
                            className={`font-button text-button ${
                              session.status === 'in_progress'
                                ? 'text-secondary-fixed-dim'
                                : 'text-primary'
                            }`}
                          >
                            {period}
                          </p>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-body-lg text-body-lg font-semibold truncate">
                            {artisteName}
                          </h4>
                          <p className="text-outline text-body-md truncate">{taskDetail}</p>
                        </div>
                        {/* Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-label-caps shrink-0 ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        {/* Actions */}
                        <button className="p-2 text-outline hover:text-primary shrink-0">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Music IQ Insights ── col-span-4 */}
          <section className="md:col-span-4 bg-surface-container-high rounded-xl p-6 border border-outline-variant/20 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-tertiary">analytics</span>
              <h3 className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest">
                Music IQ Market Insights
              </h3>
            </div>
            <div className="flex-1 space-y-6">
              {/* Trending genre */}
              <div className="p-4 bg-surface-dim rounded-xl">
                <p className="text-outline text-label-caps mb-2 text-[10px]">TRENDING GENRE</p>
                <h5 className="text-body-lg font-bold">Afro-Fusion Worship</h5>
                <div className="mt-2 h-1 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-[10px] text-tertiary mt-1">+12% engagement this week</p>
              </div>

              {/* Recommended release */}
              <div className="space-y-3">
                <p className="text-outline text-label-caps text-[10px]">RECOMMENDED RELEASE</p>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary-fixed-dim mt-1 text-lg">
                    calendar_today
                  </span>
                  <p className="text-body-md">
                    Target{' '}
                    <span className="text-secondary-fixed-dim font-bold">Friday, Oct 25</span>{' '}
                    for maximum Spotify playlisting impact.
                  </p>
                </div>
              </div>

              <Link
                href="/producer/music-iq"
                className="w-full mt-auto py-3 border border-tertiary/30 text-tertiary font-button text-button rounded-xl hover:bg-tertiary/10 transition-colors block text-center"
              >
                Full Market Report
              </Link>
            </div>
          </section>

          {/* Lyric Assistant AI ── col-span-6 */}
          <section className="md:col-span-6 bg-surface-container rounded-xl p-6 border border-outline-variant/10 relative overflow-hidden group">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined"
                  style={{ color: '#ffe16d', textShadow: '0 0 10px rgba(255,225,109,0.5)' }}
                >
                  auto_awesome
                </span>
                <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
                  Lyric Assistant AI
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-primary-container/20 text-primary rounded text-[10px] font-label-caps">
                v2.4 SPARK
              </span>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={lyricPrompt}
                  onChange={(e) => setLyricPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) handleLyricSubmit();
                  }}
                  placeholder="Paste scripture reference, theme, or voice note transcript..."
                  className="w-full bg-surface-dim border border-outline-variant/30 rounded-xl p-4 text-body-md focus:border-primary focus:ring-1 focus:ring-primary h-32 resize-none text-on-surface placeholder:text-outline"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#353534 #131313' }}
                />
                <button
                  onClick={handleLyricSubmit}
                  disabled={!lyricPrompt.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-primary rounded-lg text-on-primary shadow-lg active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>

              {/* Language pills */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['English', 'Yoruba', 'Igbo', 'Pidgin'].map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-surface-variant rounded-full text-label-caps text-outline whitespace-nowrap text-[11px] cursor-default"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              <p className="text-[10px] text-outline font-label-caps">
                ⌘ + Enter to open Lyric Assistant
              </p>
            </div>
          </section>

          {/* SmartProduce Engine ── col-span-6 */}
          <section className="md:col-span-6 bg-surface-container rounded-xl p-6 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed-dim">equalizer</span>
                <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
                  SmartProduce Engine
                </h3>
              </div>
              <Link
                href="/producer/smart-produce"
                className="text-secondary-fixed-dim text-button font-button flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">upload</span>
                Upload Stem
              </Link>
            </div>

            {/* Virtual sliders — visual only, per Stitch design */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'VOCAL', color: '#e9c400', position: 60 },
                { label: 'INSTR', color: '#cdbdff', position: 30 },
                { label: 'BASS', color: '#00daf3', position: 45 },
                { label: 'MASTER', color: '#948ea1', position: 80 },
              ].map(({ label, color, position }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="h-32 w-1.5 bg-surface-dim rounded-full relative">
                    {/* Fill */}
                    <div
                      className="absolute w-full rounded-full"
                      style={{
                        bottom: `${position}%`,
                        height: `${100 - position}%`,
                        backgroundColor: color,
                      }}
                    />
                    {/* Knob */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg"
                      style={{ bottom: `${position}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-[10px] font-label-caps text-outline">{label}</span>
                </div>
              ))}
            </div>

            {/* AI Insight chip */}
            <div className="p-3 bg-surface-variant/30 rounded-lg border border-outline-variant/10">
              <p className="text-[12px] text-on-surface-variant italic">
                &quot;AI Insight: High-end vocal crispness is low. Suggest +2dB shelf at 8kHz.&quot;
              </p>
              <Link
                href="/producer/smart-produce"
                className="mt-2 text-[10px] font-label-caps text-primary uppercase font-bold tracking-tighter inline-block hover:opacity-80 transition-opacity"
              >
                Apply Auto-Correction
              </Link>
            </div>
          </section>

          {/* Genre Benchmarking ── col-span-12 */}
          <section className="md:col-span-12 bg-surface-container rounded-xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-outline">compare_arrows</span>
              <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
                Genre Benchmarking
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-4">
                <p className="text-body-md">
                  Compare current project against successful releases in:
                </p>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-surface-dim border-outline-variant/30 rounded-lg text-body-md py-2 px-3 text-on-surface focus:border-primary focus:ring-0"
                >
                  <option>Afro-Gospel (High Energy)</option>
                  <option>Contemporary Worship</option>
                  <option>Highlife Worship</option>
                  <option>Gospel Reggae</option>
                </select>
              </div>

              {/* Stat cards — static display per design, real data from SmartProduce */}
              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div
                  className="text-center p-4 rounded-xl"
                  style={{
                    background: 'rgba(32,31,31,0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <p className="text-label-caps text-outline text-[10px]">TEMPO</p>
                  <p className="text-body-lg font-bold mt-1">128 BPM</p>
                  <p className="text-[10px] text-error mt-1">Benchmark: 124 BPM</p>
                </div>
                <div
                  className="text-center p-4 rounded-xl"
                  style={{
                    background: 'rgba(32,31,31,0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <p className="text-label-caps text-outline text-[10px]">DENSITY</p>
                  <p className="text-body-lg font-bold mt-1">High</p>
                  <p className="text-[10px] text-tertiary mt-1">Aligned</p>
                </div>
                <div
                  className="text-center p-4 rounded-xl"
                  style={{
                    background: 'rgba(32,31,31,0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <p className="text-label-caps text-outline text-[10px]">VOCAL FRONT</p>
                  <p className="text-body-lg font-bold mt-1">-4.2 LUFS</p>
                  <p className="text-[10px] text-secondary-fixed-dim mt-1">Target: -3.5 LUFS</p>
                </div>
              </div>
            </div>
          </section>

          {/* Credits badge — only shown if low balance */}
          {credits && credits.balance <= 3 && (
            <div className="md:col-span-12 flex items-center gap-3 p-4 bg-error-container/20 border border-error/30 rounded-xl">
              <span className="material-symbols-outlined text-error">warning</span>
              <p className="text-body-md text-error">
                Low credits: <strong>{credits.balance} remaining.</strong>{' '}
                <Link href="/producer/billing" className="underline hover:opacity-80">
                  Top up to continue generating.
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 py-12 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-headline-lg text-headline-lg text-on-surface opacity-50">
              Zamar.AI
            </h4>
            <p className="text-outline text-body-md mt-2">
              © 2024 Zamar.AI • A Ministry of i-Yadah Network
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {['Terms of Grace', 'Privacy Policy', 'Contact Support', 'Affiliations'].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-outline hover:text-primary transition-colors font-label-caps text-label-caps uppercase text-[11px]"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </footer>
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-surface-container border-t border-outline-variant/20 flex justify-around items-center py-3 z-50">
        <Link href="/producer" className="flex flex-col items-center text-primary">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            dashboard
          </span>
          <span className="text-[10px] font-label-caps">Home</span>
        </Link>
        <Link
          href="/producer/lyric-assistant"
          className="flex flex-col items-center text-on-surface-variant"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="text-[10px] font-label-caps">Lyric</span>
        </Link>
        <Link
          href="/producer/smart-produce"
          className="flex flex-col items-center text-on-surface-variant"
        >
          <span className="material-symbols-outlined">equalizer</span>
          <span className="text-[10px] font-label-caps">Mix</span>
        </Link>
        <Link href="/producer/settings" className="flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-label-caps">Profile</span>
        </Link>
      </nav>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #131313; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #353534; border-radius: 10px; }
      `}</style>
    </div>
  );
}
