import Fastify from "fastify";
import type { HelpRequest } from "@allaboard/types";

const mockFeed: HelpRequest[] = [
  {
    id: "1",
    title: "How do I get started?",
    authorId: "user-1",
    createdAt: new Date().toISOString(),
  },
];

export function buildApp() {
  const app = Fastify({ logger: false });
  app.get("/health", async () => ({ status: "ok" as const }));
  app.get("/feed", async () => ({ items: mockFeed }));
  return app;
}
