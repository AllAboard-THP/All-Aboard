"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

export function HelpRequestForm() {
  const [userId, setUserId] = useState("bob");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, password }),
      });
      if (!loginRes.ok) {
        const t = await loginRes.text();
        setError(loginRes.status === 401 ? "Identifiants invalides." : t);
        return;
      }
      const tags = tagsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const createRes = await fetch("/api/help-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          ...(tags.length ? { tags } : {}),
        }),
      });
      const createText = await createRes.text();
      if (createRes.status === 409) {
        const j = JSON.parse(createText) as { existingId?: string };
        setError(
          `Doublon détecté (MOC). Demande existante : ${j.existingId ?? "?"}.`,
        );
        return;
      }
      if (!createRes.ok) {
        setError(createText || `Erreur ${createRes.status}`);
        return;
      }
      const j = JSON.parse(createText) as {
        item: { id: string };
        hints?: { rubberduckEligible?: boolean };
      };
      setMessage(
        `Demande créée (${j.item.id})` +
          (j.hints?.rubberduckEligible
            ? " — Rubberduck (stub) : titre court, piste IA possible."
            : ""),
      );
      setTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: "20px", display: "grid", gap: "14px" }}>
      <label style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
        <span style={{ color: "#cbd5e1" }}>Identifiant utilisateur</span>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={inputStyle}
          autoComplete="username"
        />
      </label>
      <label style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
        <span style={{ color: "#cbd5e1" }}>Mot de passe MVP</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          autoComplete="current-password"
        />
      </label>
      <label style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
        <span style={{ color: "#cbd5e1" }}>Titre de la demande</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: "grid", gap: "6px", fontSize: "14px" }}>
        <span style={{ color: "#cbd5e1" }}>Tags (optionnel, séparés par virgule)</span>
        <input
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          style={inputStyle}
          placeholder="mentor, rails"
        />
      </label>
      {error ? (
        <p style={{ color: "#fca5a5", margin: 0, fontSize: "14px" }}>{error}</p>
      ) : null}
      {message ? (
        <p style={{ color: "#86efac", margin: 0, fontSize: "14px" }}>{message}</p>
      ) : null}
      <button
        type="button"
        disabled={busy || !title.trim() || !password}
        onClick={() => void submit()}
        style={{
          marginTop: "4px",
          cursor: busy ? "wait" : "pointer",
          borderRadius: "10px",
          border: "none",
          padding: "12px 16px",
          fontWeight: 700,
          fontSize: "15px",
          color: "#0f172a",
          background: busy ? "#94a3b8" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
        }}
      >
        {busy ? "Envoi…" : "Connexion et publier"}
      </button>
    </div>
  );
}

const inputStyle: CSSProperties = {
  borderRadius: "8px",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "rgba(2, 6, 23, 0.5)",
  color: "#f8fafc",
  padding: "10px 12px",
  fontSize: "15px",
};
