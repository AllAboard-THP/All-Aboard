"use client";

import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";

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
    <div className="mt-5 grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="help-user-id">Identifiant utilisateur</Label>
        <Input
          id="help-user-id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-password">Mot de passe MVP</Label>
        <Input
          id="help-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-title">Titre de la demande</Label>
        <Input
          id="help-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="help-tags">Tags (optionnel, séparés par virgule)</Label>
        <Input
          id="help-tags"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="mentor, rails"
        />
      </div>
      {error ? (
        <p className="m-0 text-sm text-destructive">{error}</p>
      ) : null}
      {message ? (
        <p className="m-0 text-sm text-primary">{message}</p>
      ) : null}
      <Button
        type="button"
        disabled={busy || !title.trim() || !password}
        onClick={() => void submit()}
        className="mt-1 w-full"
      >
        {busy ? "Envoi…" : "Connexion et publier"}
      </Button>
    </div>
  );
}
