"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Sidebar from "@/app/components/Sidebar";

interface Booking {
    id: string;
    title: string;
    session_style: string;
    start_time: string;
    duration_hours: number;
    status: "open" | "accepted" | "completed";
    artist_id: string;
    producer_id: string | null;
    feedback_notes: string | null;
}

export default function StudioSessionsPage() {
    const router = useRouter();
    const supabase = createClient();

    // User Profile Information
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<"artist" | "producer">("artist");

    // Dynamic Lists
    const [bookings, setBookings] = useState<Booking[]>([]);
    
    // Form States
    const [title, setTitle] = useState("");
    const [style, setStyle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [duration, setDuration] = useState(2);
    const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});

    // Status UI States
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        async function initializeDashboard() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/");
                return;
            }
            setUserId(user.id);

            // Fetch user meta metadata role mapping if configured inside app metadata
            const metadataRole = user.user_metadata?.role;
            if (metadataRole === "producer") {
                setUserRole("producer");
            } else {
                setUserRole("artist");
            }

            fetchBookings();
        }
        initializeDashboard();
    }, []);

    async function fetchBookings() {
        setLoading(true);
        const { data, error } = await supabase
            .from("studio_bookings")
            .select("*")
            .order("start_time", { ascending: true });

        if (!error && data) {
            setBookings(data as Booking[]);
        }
        setLoading(false);
    }

    // Artist Actions: Submit structural session layout requests
    async function handleCreateBooking(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !style || !startTime) return;
        setActionLoading(true);

        const { error } = await supabase
            .from("studio_bookings")
            .insert({
                title,
                session_style: style,
                start_time: new Date(startTime).toISOString(),
                duration_hours: Number(duration),
                artist_id: userId,
                status: "open"
            });

        if (!error) {
            setTitle("");
            setStyle("");
            setStartTime("");
            fetchBookings();
        }
        setActionLoading(false);
    }

    // Producer Actions: Claim a session slot
    async function handleAcceptBooking(bookingId: string) {
        setActionLoading(true);
        const { error } = await supabase
            .from("studio_bookings")
            .update({
                producer_id: userId,
                status: "accepted"
            })
            .eq("id", bookingId);

        if (!error) fetchBookings();
        setActionLoading(false);
    }

    // Artist Actions: Submit post-session feedback
    async function handleSubmitFeedback(bookingId: string) {
        const text = feedbackText[bookingId];
        if (!text?.trim()) return;

        setActionLoading(true);
        const { error } = await supabase
            .from("studio_bookings")
            .update({
                feedback_notes: text,
                status: "completed"
            })
            .eq("id", bookingId);

        if (!error) fetchBookings();
        setActionLoading(false);
    }

    // Evaluator: Checks if the session duration block has fully passed right now
    const isSessionOver = (startTimeIso: string, durationHours: number) => {
        const sessionEndTime = new Date(startTimeIso).getTime() + (durationHours * 60 * 60 * 1000);
        return Date.now() > sessionEndTime;
    };

    return (
        <div className="flex min-h-screen text-white" style={{ backgroundColor: "#131313" }}>
            <Sidebar onSignOut={async () => { await supabase.auth.signOut(); router.replace("/"); }} />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
                <header className="border-b pb-4 flex justify-between items-center" style={{ borderColor: "rgba(73,68,85,0.25)" }}>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>Studio Hub Sessions</h1>
                        <p className="text-xs text-gray-400 font-mono">Simulating workspace as: <span className="text-[#00daf3] uppercase font-bold">{userRole}</span></p>
                    </div>
                    
                    {/* Fast Role Simulator Switch Tag - For Easy Testing */}
                    <button 
                        onClick={() => setUserRole(userRole === "artist" ? "producer" : "artist")}
                        className="text-xs px-3 py-1.5 rounded-lg font-mono border border-gray-700 bg-white/5 hover:bg-white/10 transition-all"
                    >
                        Toggle Role Simulation
                    </button>
                </header>

                <main className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    
                    {/* LEFT PANEL: ARTISt BOOKING SLOTS FORM CREATION CONTAINER */}
                    {userRole === "artist" && (
                        <div className="p-5 rounded-xl space-y-4" style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}>
                            <h2 className="text-sm font-bold tracking-wider uppercase text-gray-300 font-mono">Book Studio Room Time</h2>
                            <form onSubmit={handleCreateBooking} className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Project/Song Work Title</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mixing Vocal Masters" className="w-full px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg outline-none text-white focus:border-[#7c4dff]" required />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Genre/Style Vibe</label>
                                    <input type="text" value={style} onChange={e => setStyle(e.target.value)} placeholder="e.g. Synthwave Melodic Pop" className="w-full px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg outline-none text-white focus:border-[#7c4dff]" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Date & Launch Time</label>
                                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-gray-800 rounded-lg outline-none text-white text-xs focus:border-[#7c4dff]" style={{ colorScheme: "dark" }} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Duration (Hours)</label>
                                        <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-3 py-2.5 bg-white/5 border border-gray-800 rounded-lg outline-none text-white focus:border-[#7c4dff]">
                                            {[1].map(h => <option key={h} value={h} className="bg-[#1c1b1b]">{h} Hour</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" disabled={actionLoading} className="w-full py-2.5 rounded-lg font-semibold bg-[#7c4dff] hover:bg-[#693ce6] text-white disabled:opacity-40 transition-colors">
                                    Request Allocation Slot
                                </button>
                            </form>
                        </div>
                    )}

                    {/* RIGHT PANEL: DYNAMIC LIVE LOGISTICS BOARD VIEWPORT */}
                    <div className={userRole === "artist" ? "xl:col-span-2 space-y-4" : "xl:col-span-3 space-y-4"}>
                        <h2 className="text-sm font-bold tracking-wider uppercase text-gray-300 font-mono">Live Sessions Registry Matrix</h2>

                        {loading ? (
                            <p className="text-xs text-gray-500 font-mono animate-pulse">Syncing tracking array logs...</p>
                        ) : bookings.length === 0 ? (
                            <p className="text-sm text-gray-500 py-12 text-center border border-dashed border-gray-800 rounded-xl">No scheduling records populated in system.</p>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((session) => {
                                    const pastTime = isSessionOver(session.start_time, session.duration_hours);
                                    const isOwnSession = session.artist_id === userId;

                                    return (
                                        <div key={session.id} className="p-4 rounded-xl border flex flex-col space-y-4 transition-all" style={{ background: "rgba(22,22,22,0.6)", borderColor: "rgba(73,68,85,0.2)" }}>
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-base font-semibold">{session.title}</h3>
                                                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded" style={{ 
                                                            background: session.status === "open" ? "rgba(0,218,243,0.15)" : session.status === "accepted" ? "rgba(124,77,255,0.15)" : "rgba(34,197,94,0.15)",
                                                            color: session.status === "open" ? "#00daf3" : session.status === "accepted" ? "#cdbdff" : "#4ade80"
                                                        }}>
                                                            {session.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5 font-mono">Arrangement Profile: <span className="text-gray-200">{session.session_style}</span> | Duration: {session.duration_hours}H</p>
                                                    <p className="text-xs text-gray-500 font-mono">Date: {new Date(session.start_time).toLocaleString()}</p>
                                                </div>

                                                {/* ACTION INTERFACE BRANCH: PRODUCER INTERACTION FLOW */}
                                                {userRole === "producer" && session.status === "open" && (
                                                    <button onClick={() => handleAcceptBooking(session.id)} disabled={actionLoading} className="px-4 py-2 bg-[#00daf3] text-black font-semibold rounded-lg text-xs hover:bg-[#02b9ce] transition-colors">
                                                        Accept Live Tracking Booking
                                                    </button>
                                                )}
                                            </div>

                                            {/* FEEDBACK CONTAINER BLOCK: GATED STRICTLY FOR BOOKING ARTIST POST-SESSION */}
                                            {isOwnSession && pastTime && !session.feedback_notes && (
                                                <div className="pt-3 border-t border-white/5 space-y-2">
                                                    <label className="block text-xs font-mono font-bold text-purple-300">🚨 POST-SESSION AUDIT AND CRITIQUE FEEDBACK</label>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Add engineering workspace notes, gear details, review tracking session notes..."
                                                            value={feedbackText[session.id] || ""}
                                                            onChange={e => setFeedbackText({ ...feedbackText, [session.id]: e.target.value })}
                                                            className="flex-1 px-3 py-2 bg-white/5 text-xs border border-gray-800 rounded-lg outline-none text-white"
                                                        />
                                                        <button onClick={() => handleSubmitFeedback(session.id)} disabled={actionLoading} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg text-xs hover:bg-purple-700 transition-colors">
                                                            Submit Archive Feedback
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* INLINE RENDERING OF PERSISTED FEEDBACK ARCHIVE */}
                                            {session.feedback_notes && (
                                                <div className="p-3 bg-white/5 border border-gray-800/60 rounded-lg text-xs">
                                                    <p className="font-mono font-bold text-gray-400 mb-0.5">Artist Post-Meeting Assessment Log:</p>
                                                    <p className="text-gray-300 italic">"{session.feedback_notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}