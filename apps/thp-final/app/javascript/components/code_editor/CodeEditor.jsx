import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"

const LANGUAGE_MAP = {
  plaintext:  "plaintext",
  python:     "python",
  javascript: "javascript",
  typescript: "typescript",
  html:       "html",
  css:        "css",
  ruby:       "ruby",
  java:       "java",
  c:          "c",
  cpp:        "cpp",
  csharp:     "csharp",
  php:        "php",
  go:         "go",
  rust:       "rust",
  sql:        "sql",
  bash:       "shell",
  r:          "r",
  json:       "json",
  latex:      "plaintext",
  matlab:     "plaintext"
}

export default function CodeEditor({ fieldId, language = "plaintext", initialValue = "" }) {
  const [value, setValue]       = useState(initialValue)
  const [langKey, setLangKey]   = useState(language)
  const hiddenField             = document.getElementById(fieldId)
  const langSelectId            = fieldId?.replace("code_snippet", "code_language")
  const langSelect              = document.getElementById(langSelectId)

  // Sync caché vers Rails
  useEffect(() => {
    if (hiddenField) hiddenField.value = value
  }, [value])

  // Écoute les changements du select de langage
  useEffect(() => {
    if (!langSelect) return
    const handler = (e) => setLangKey(e.target.value)
    langSelect.addEventListener("change", handler)
    return () => langSelect.removeEventListener("change", handler)
  }, [langSelect])

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e]">
      <Editor
        height="160px"
        language={LANGUAGE_MAP[langKey] || "plaintext"}
        value={value}
        onChange={(v) => setValue(v || "")}
        theme="vs-dark"
        options={{
          fontSize:         13,
          minimap:          { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap:         "on",
          lineNumbers:      "on",
          folding:          false,
          renderLineHighlight: "none",
          padding:          { top: 10, bottom: 10 },
          fontFamily:       "'JetBrains Mono', 'Fira Code', monospace",
          automaticLayout:  true,
          tabSize:          2,
        }}
        loading={
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
            <i className="fas fa-circle-notch fa-spin mr-2"></i>Chargement de l'éditeur…
          </div>
        }
      />
    </div>
  )
}
