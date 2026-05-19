"use client";

import { useEffect, useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const threads = [
  { id: "1", title: "Aide analyse", preview: "Merci pour les retours !" },
  { id: "2", title: "Projet React", preview: "On peut pairer demain ?" },
] as const;

export default function MessagesPage() {
  const [active, setActive] = useState<string>("1");
  const [hydrated, setHydrated] = useState(false);
  const thread = threads.find((t) => t.id === active) ?? threads[0];

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div
      data-testid="messages-page"
      className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[280px_1fr] md:p-6"
    >
      {hydrated ? (
        <span data-testid="messages-hydrated" className="sr-only" aria-hidden />
      ) : null}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0 pb-4">
          <ul data-testid="messages-list" aria-label="Liste des conversations">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  data-testid={`thread-${t.id}`}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-secondary focus-ring",
                    active === t.id && "bg-secondary font-semibold",
                  )}
                  onClick={() => setActive(t.id)}
                >
                  <span className="block font-medium">{t.title}</span>
                  <span className="text-muted-foreground">{t.preview}</span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card data-testid="messages-chat">
        <CardHeader>
          <CardTitle>{thread.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="min-h-[200px] rounded-md border border-border bg-background/50 p-4"
            data-testid="chat-react-panel"
          >
            <p className="text-sm text-muted-foreground">
              Panneau chat React (MVP kit — sans temps réel, voir WONTFIX-P3-01).
            </p>
            <p className="mt-4 text-sm">{thread.preview}</p>
            <div className="mt-4">
              <CodeBlock code={'const reply = "Merci pour l\'aide !";'} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
