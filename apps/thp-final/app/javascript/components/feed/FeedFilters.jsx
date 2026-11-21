import { useState, useEffect, useCallback } from "react"

export default function FeedFilters({ subjects, currentSubjectSlug, currentTag, feedPath }) {
  const [selected, setSelected] = useState(currentSubjectSlug || null)
  const [search,   setSearch]   = useState("")
  const [debounce, setDebounce] = useState(null)

  const navigate = useCallback((subjectSlug, q = "") => {
    const url = new URL(feedPath, window.location.origin)
    if (subjectSlug) url.searchParams.set("subject", subjectSlug)
    if (q)           url.searchParams.set("q", q)
    window.Turbo?.visit(url.toString()) || (window.location.href = url.toString())
  }, [feedPath])

  const handleSubject = (slug) => {
    const next = selected === slug ? null : slug
    setSelected(next)
    navigate(next, search)
  }

  const handleSearch = (e) => {
    const q = e.target.value
    setSearch(q)
    clearTimeout(debounce)
    if (q.length === 0) {
      navigate(selected, "")
      return
    }
    if (q.length < 2) return
    setDebounce(setTimeout(() => navigate(selected, q), 400))
  }

  return (
    <div className="space-y-4">
      {/* Sujets */}
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Bouton Nouveau */}
        <button type="button"
                className="w-20 flex flex-col items-center gap-2 cursor-pointer group"
                data-action="click->modal#open"
                data-modal-id="request-subject-modal">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] group-hover:scale-110 transition-transform">
            <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center">
              <i className="fas fa-plus text-primary"></i>
            </div>
          </div>
          <span className="text-xs text-gray-400">Nouveau</span>
        </button>

        {subjects.map((s) => (
          <button key={s.slug}
                  onClick={() => handleSubject(s.slug)}
                  className="w-20 flex flex-col items-center gap-2 cursor-pointer group">
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all
                           group-hover:scale-110 ${selected === s.slug ? "scale-110 ring-2 ring-offset-2 ring-offset-transparent" : ""}`}
                 style={{
                   backgroundColor: `${s.accent_color}${selected === s.slug ? "33" : "1F"}`,
                   borderColor:     `${s.accent_color}${selected === s.slug ? "99" : "4D"}`,
                   color:           s.accent_color,
                   ringColor:       s.accent_color
                 }}>
              <i className={`fas ${s.icon} text-xl`}></i>
            </div>
            <span className={`text-xs transition-colors ${selected === s.slug ? "text-white font-medium" : "text-gray-400"}`}>
              {s.name}
            </span>
          </button>
        ))}
      </div>

      {/* Barre de recherche intégrée */}
      <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
        <i className="fas fa-search text-gray-500 text-sm flex-shrink-0"></i>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Rechercher titre, tag, contenu…"
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-500"
          autoComplete="off"
        />
        {(search || selected) && (
          <button onClick={() => { setSearch(""); setSelected(null); navigate(null, "") }}
                  className="text-gray-500 hover:text-white text-xs transition-colors">
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    </div>
  )
}
