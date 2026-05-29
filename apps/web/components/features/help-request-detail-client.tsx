"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateResponseResponse,
  HelpRequestDetailResponse,
} from "@allaboard/types";

import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { Input } from "@allaboard/ui/components/input";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";
import { useState } from "react";

type Props = {
  requestId: string;
  initialDetail: HelpRequestDetailResponse;
};

async function fetchDetail(id: string): Promise<HelpRequestDetailResponse> {
  const res = await fetch(`/api/help-requests/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Detail ${res.status}`);
  }
  return (await res.json()) as HelpRequestDetailResponse;
}

async function loginAndRespond(input: {
  email: string;
  password: string;
  body: string;
  requestId: string;
}): Promise<CreateResponseResponse> {
  const loginRes = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
  if (!loginRes.ok) {
    const t = await loginRes.text();
    throw new Error(loginRes.status === 401 ? "Identifiants invalides." : t);
  }

  const createRes = await fetch(
    `/api/help-requests/${encodeURIComponent(input.requestId)}/responses`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: input.body }),
    },
  );
  const createText = await createRes.text();
  if (!createRes.ok) {
    throw new Error(createText || `Erreur ${createRes.status}`);
  }
  return JSON.parse(createText) as CreateResponseResponse;
}

export function HelpRequestDetailClient({ requestId, initialDetail }: Props) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("alice@dev.local");
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");

  const q = useQuery({
    queryKey: ["help-request", requestId],
    queryFn: () => fetchDetail(requestId),
    initialData: initialDetail,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: loginAndRespond,
    onSuccess: async () => {
      setBody("");
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["help-request", requestId] });
    },
  });

  const detail = q.data ?? initialDetail;
  const responses = detail.responses ?? [];

  function submit() {
    mutation.mutate({ email, password, body, requestId });
  }

  const errorMessage = mutation.error?.message ?? null;

  return (
    <>
      {q.isFetching && !q.isPending ? (
        <p
          className="mb-3 text-sm text-muted-foreground"
          data-testid="help-request-refetching"
        >
          Mise à jour…
        </p>
      ) : null}

      <section aria-label="Réponses" className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Réponses</h2>
        {responses.length === 0 ? (
          <Card data-testid="responses-empty">
            <CardHeader>
              <CardTitle className="text-base">
                Aucune réponse pour l&apos;instant
              </CardTitle>
              <CardDescription>
                Les réponses de la communauté et des mentors apparaîtront ici.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul
            className="flex list-none flex-col gap-3 p-0"
            data-testid="responses-list"
          >
            {responses.map((r) => (
              <li key={r.id} data-testid="response-item">
                <Card>
                  <CardContent className="pt-6">
                    <p className="m-0 text-sm text-foreground">{r.body}</p>
                    <p className="mt-2 mb-0 text-xs text-muted-foreground">
                      {r.authorId}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Répondre" className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Répondre
        </h2>
        <Card data-testid="response-form">
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="response-email">Email</Label>
              <Input
                id="response-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response-password">Mot de passe</Label>
              <Input
                id="response-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response-body">Votre réponse</Label>
              <Textarea
                id="response-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
              />
            </div>
            {errorMessage ? (
              <p className="m-0 text-sm text-destructive">{errorMessage}</p>
            ) : null}
            <Button
              type="button"
              disabled={mutation.isPending || !body.trim() || !password}
              onClick={() => submit()}
            >
              {mutation.isPending ? "Envoi…" : "Connexion et répondre"}
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
