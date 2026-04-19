import { useState } from "react"
import Editor from "@monaco-editor/react"

const STEPS = ["Titre", "Description", "Code", "Tags & Envoi"]

const LANGUAGES = [
  ["— Langage —", "plaintext"], ["Python", "python"], ["JavaScript", "javascript"],
  ["TypeScript", "typescript"], ["HTML", "html"], ["CSS", "css"], ["Ruby", "ruby"],
  ["Java", "java"], ["C", "c"], ["C++", "cpp"], ["C#", "csharp"], ["PHP", "php"],
  ["Go", "go"], ["Rust", "rust"], ["SQL", "sql"], ["Bash / Shell", "bash"],
  ["R", "r"], ["JSON", "json"], ["Texte brut", "plaintext"]
]

const MONACO_MAP = {
  plaintext: "plaintext", python: "python", javascript: "javascript",
  typescript: "typescript", html: "html", css: "css", ruby: "ruby",
  java: "java", c: "c", cpp: "cpp", csharp: "csharp", php: "php",
  go: "go", rust: "rust", sql: "sql", bash: "shell", r: "r", json: "json"
}

export default function PostForm({ subjects, educationLevel, postsPath, csrfToken, onClose }) {
  const [step,     setStep]     = useState(0)
  const [title,    setTitle]    = useState("")
  const [body,     setBody]     = useState("")
  const [code,     setCode]     = useState("")
  const [lang,     setLang]     = useState("plaintext")
  const [tags,     setTags]     = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [urgent,   setUrgent]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors,   setErrors]   = useState([])

  const canNext = () => {
    if (step === 0) return title.trim().length >= 5
    if (step === 1) return body.trim().length >= 10
    return true
  }

  const submit = async () => {
    setSubmitting(true)
    setErrors([])
    const form = new FormData()
    form.append("post[title]",           title)
    form.append("post[body]",            body)
    form.append("post[code_snippet]",    code)
    form.append("post[code_language]",   lang)
    form.append("post[tag_list]",        tags)
    form.append("post[subject_id]",      subjectId)
    form.append("post[urgent]",          urgent ? "1" : "0")
    form.append("post[education_level]", educationLevel || "")

    try {
      const res = await fetch(postsPath, {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken, "Accept": "text/html, application/xhtml+xml" },
        body: form,
        redirect: "follow"
      })
      if (res.ok || res.redirected) {
        window.Turbo?.visit(res.url || postsPath) || (window.location.href = res.url || postsPath)
      } else {
        setErrors(["Une erreur est survenue. Vérifiez les champs obligatoires."])
        setSubmitting(false)
      }
    } catch {
      setErrors(["Erreur réseau, réessayez."])
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <button onClick={() => i < step && setStep(i)}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors
                      ${i === step  ? "bg-primary text-white"
                      : i < step    ? "bg-primary/30 text-primary cursor-pointer hover:bg-primary/50"
                      :               "bg-white/10 text-gray-500"}`}>
              {i < step ? <i className="fas fa-check text-[10px]"></i> : i + 1}
            </button>
            <span className={`text-xs hidden sm:block ${i === step ? "text-white" : "text-gray-500"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? "bg-primary/50" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Étape 0 — Titre */}
      {step === 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">Titre <span className="text-red-400">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                 placeholder="Ex: Erreur undefined sur ma fonction async"
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                 autoFocus />
          <p className="text-xs text-gray-500">{title.length}/100 caractères · minimum 5</p>

          {/* Preview titre */}
          {title.trim().length >= 5 && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 mb-1">Aperçu</p>
              <p className="font-semibold text-sm">{title}</p>
            </div>
          )}
        </div>
      )}

      {/* Étape 1 — Description */}
      {step === 1 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">Description <span className="text-red-400">*</span></label>
          <textarea value={body} onChange={e => setBody(e.target.value)}
                    rows={5} placeholder="Décrivez votre problème en détail..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary resize-none"
                    autoFocus />
          <p className="text-xs text-gray-500">{body.length} caractères · minimum 10</p>
        </div>
      )}

      {/* Étape 2 — Code */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Bloc de code <span className="text-gray-500 text-xs">(optionnel)</span></label>
            <select value={lang} onChange={e => setLang(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary">
              {LANGUAGES.map(([label, val]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10">
            <Editor height="180px" language={MONACO_MAP[lang] || "plaintext"}
                    value={code} onChange={v => setCode(v || "")}
                    theme="vs-dark"
                    options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false,
                               wordWrap: "on", padding: { top: 10, bottom: 10 }, automaticLayout: true }} />
          </div>
        </div>
      )}

      {/* Étape 3 — Tags & envoi */}
      {step === 3 && (
        <div className="space-y-4">
          {errors.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          {/* Matière */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Matière <span className="text-xs text-gray-500">(1 seul)</span></p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {subjects.map(s => (
                <button key={s.id} type="button" onClick={() => setSubjectId(s.id.toString())}
                        className={`p-3 rounded-lg border text-sm text-center transition-colors
                          ${subjectId === s.id.toString()
                            ? "bg-primary border-primary text-white"
                            : "bg-white/5 border-white/10 hover:border-primary"}`}>
                  <i className={`fas ${s.icon} mr-2`}></i>{s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Sous-tags <span className="text-xs text-gray-500">optionnel · max 6</span></p>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                   placeholder="Ex : boucle for, async/await — séparés par virgules"
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm" />
          </div>

          {/* Urgent */}
          <label className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl cursor-pointer">
            <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)}
                   className="rounded bg-white/10 border-white/30 text-primary focus:ring-primary" />
            <span className="text-sm text-orange-400 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i> Marquer comme urgent
            </span>
          </label>

          {/* Résumé */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm space-y-1">
            <p className="font-semibold text-gray-300 mb-2">Résumé</p>
            <p><span className="text-gray-500">Titre :</span> {title}</p>
            <p><span className="text-gray-500">Description :</span> {body.slice(0, 80)}{body.length > 80 ? "…" : ""}</p>
            {code && <p><span className="text-gray-500">Code :</span> <span className="font-mono text-xs">{lang}</span></p>}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors">
            Précédent
          </button>
        )}
        {onClose && step === 0 && (
          <button onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors">
            Annuler
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-medium transition-colors">
            Suivant
          </button>
        ) : (
          <button onClick={submit}
                  disabled={submitting || !title.trim() || !body.trim()}
                  className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-40 text-white font-medium transition-colors">
            {submitting ? <><i className="fas fa-circle-notch fa-spin mr-2"></i>Envoi…</> : "Publier"}
          </button>
        )}
      </div>
    </div>
  )
}
