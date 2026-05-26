"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";

type CreateResult = {
  item: { id: string };
  hints?: { rubberduckEligible?: boolean };
};

type DuplicateError = {
  existingId?: string;
};

async function loginAndCreate(input: {
  userId: string;
  password: string;
  title: string;
  tags: string[];
}): Promise<CreateResult> {
  const loginRes = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ userId: input.userId, password: input.password }),
  });
  if (!loginRes.ok) {
    const t = await loginRes.text();
    throw new Error(loginRes.status === 401 ? "Identifiants invalides." : t);
  }

  const createRes = await fetch("/api/help-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: input.title,
      ...(input.tags.length ? { tags: input.tags } : {}),
    }),
  });
  const createText = await createRes.text();

  if (createRes.status === 409) {
    const dup = JSON.parse(createText) as DuplicateError;
    const err = new Error("duplicate") as Error & { existingId?: string };
    err.existingId = dup.existingId;
    throw err;
  }
  if (!createRes.ok) {
    throw new Error(createText || `Erreur ${createRes.status}`);
  }
  return JSON.parse(createText) as CreateResult;
}

export function HelpRequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("bob");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [rubberduckHint, setRubberduckHint] = useState(false);

  const mutation = useMutation({
    mutationFn: loginAndCreate,
    onSuccess: async (data) => {
      setDuplicateId(null);
      setRubberduckHint(Boolean(data.hints?.rubberduckEligible));
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (data.hints?.rubberduckEligible) {
        setTitle("");
        return;
      }
      router.push(`/requests/${data.item.id}`);
    },
    onError: (err: Error & { existingId?: string }) => {
      setRubberduckHint(false);
      if (err.message === "duplicate" && err.existingId) {
        setDuplicateId(err.existingId);
      } else {
        setDuplicateId(null);
      }
    },
  });

  function submit() {
    setDuplicateId(null);
    setRubberduckHint(false);
    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    mutation.mutate({ userId, password, title, tags });
  }

  const errorMessage =
    mutation.error && mutation.error.message !== "duplicate"
      ? mutation.error.message
      : null;

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
      {errorMessage ? (
        <p className="m-0 text-sm text-destructive">{errorMessage}</p>
      ) : null}
      {duplicateId ? (
        <p className="m-0 text-sm text-destructive">
          Doublon détecté (MOC).{" "}
          <Link
            href={`/requests/${duplicateId}`}
            className="font-medium text-primary underline"
          >
            Voir la demande existante
          </Link>
        </p>
      ) : null}
      {rubberduckHint ? (
        <p className="m-0 text-sm text-primary">
          Rubberduck (stub) : titre court — piste IA possible (Phase 4). Publiez
          une nouvelle demande ou consultez le feed.
        </p>
      ) : null}
      <Button
        type="button"
        disabled={mutation.isPending || !title.trim() || !password}
        onClick={() => submit()}
        className="mt-1 w-full"
      >
        {mutation.isPending ? "Envoi…" : "Connexion et publier"}
      </Button>
    </div>
  );
}
