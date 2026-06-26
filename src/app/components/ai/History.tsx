import { AIResult } from "@/lib/ai/types";


interface HistoryProps {
    history: AIResult[]

    onSelect: (item: AIResult) => void
}

function History({ history, onSelect }: HistoryProps) {
    return (
        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
                <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Recent Generations</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(73,68,85,0.12)" }}>
                {history.map(h => (
                    <button
                        key={h.id}
                        onClick={() => onSelect(h)}
                        className="w-full text-left px-5 py-3.5 transition-all"
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(124,77,255,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        <p className="text-xs font-medium text-white truncate mb-0.5" style={{ fontFamily: "var(--font-hanken)" }}>{h.prompt.slice(0, 50)}{h.prompt.length > 50 ? "…" : ""}</p>
                        <p className="text-[10px]" style={{ fontFamily: "var(--font-jetbrains)", color: "#494455" }}>
                            {h.language} · {h.style} · {new Date(h.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </p>
                    </button>
                ))}
            </div>
        </div>

    )
};

export default History;