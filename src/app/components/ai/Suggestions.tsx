interface SuggestionsProps {

    suggestions: string[]

    onSelect: (prompt: string) => void

}

function Suggestions({ suggestions, onSelect }: SuggestionsProps) {

    return (
        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(28,27,27,0.8)", border: "1px solid rgba(73,68,85,0.2)" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(73,68,85,0.2)" }}>
                  <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Inspiration Seeds</h3>
                  <p className="text-xs mt-0.5" style={{ fontFamily: "var(--font-hanken)", color: "#948ea1" }}>Click any to use as your prompt</p>
                </div>
                <div className="p-3 space-y-2">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => onSelect(s)}
                      className="w-full text-left px-4 py-3 rounded-lg text-xs transition-all"
                      style={{ fontFamily: "var(--font-hanken)", color: "#cac3d8", border: "1px solid rgba(73,68,85,0.15)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(124,77,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,77,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "#e5e2e1"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(73,68,85,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#cac3d8"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
    )
};

export default Suggestions;