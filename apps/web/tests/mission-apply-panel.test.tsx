import type { Mission } from "@allaboard/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

import { MissionApplyPanel } from "@/components/features/mission-apply-panel";
import { GITHUB_REPO_RE } from "@/components/features/mission-form";
import { renderWithI18n } from "./i18n-test-utils";

const refresh = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mission: Mission = {
  id: "m1",
  kind: "personal_project",
  title: "Add passkeys",
  description: "Passkeys on a Next.js app.",
  places: 2,
  acceptedCount: 0,
  applicationCount: 0,
  status: "open",
  skills: [],
  author: { id: "mentor-1", displayName: "Alice" },
  createdAt: "2026-11-24T00:00:00.000Z",
  updatedAt: "2026-11-24T00:00:00.000Z",
};

function renderPanel(props: { mission?: Mission; viewerId?: string } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <MissionApplyPanel mission={props.mission ?? mission} viewerId={props.viewerId ?? "dev-1"} />
    </QueryClientProvider>,
  );
}

describe("MissionApplyPanel", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    refresh.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the author their management links instead of the form", () => {
    renderPanel({ viewerId: "mentor-1" });
    expect(screen.getByTestId("mission-author-actions")).toBeTruthy();
    expect(screen.queryByTestId("mission-apply-form")).toBeNull();
  });

  it("posts an application and refreshes", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ item: { id: "a1" } }), { status: 201 }),
    );
    renderPanel();
    fireEvent.change(screen.getByLabelText("Pourquoi toi ?"), {
      target: { value: "I shipped passkeys before." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Candidater" }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/missions/m1/applications",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "I shipped passkeys before." }),
      }),
    );
  });

  it("translates an API refusal", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "mission_not_open" }), { status: 409 }),
    );
    renderPanel();
    fireEvent.change(screen.getByLabelText("Pourquoi toi ?"), { target: { value: "Me" } });
    fireEvent.click(screen.getByRole("button", { name: "Candidater" }));
    expect(
      await screen.findByText("Cette mission n'accepte plus de candidatures."),
    ).toBeTruthy();
  });

  it("shows the viewer's application status and lets them withdraw", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    renderPanel({ mission: { ...mission, viewerApplication: { id: "a1", status: "accepted" } } });
    expect(screen.getByText("Ta candidature : Acceptée")).toBeTruthy();
    fireEvent.click(screen.getByTestId("mission-withdraw-application"));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/missions/m1/applications/mine",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("says when a mission no longer takes applications", () => {
    renderPanel({ mission: { ...mission, status: "in_progress" } });
    expect(screen.getByTestId("mission-closed")).toBeTruthy();
  });
});

describe("GitHub repository check", () => {
  it("matches the API rule", () => {
    expect(GITHUB_REPO_RE.test("https://github.com/allaboard/web")).toBe(true);
    expect(GITHUB_REPO_RE.test("https://github.com/allaboard/web/")).toBe(true);
    expect(GITHUB_REPO_RE.test("https://gitlab.com/allaboard/web")).toBe(false);
    expect(GITHUB_REPO_RE.test("https://github.com/allaboard")).toBe(false);
  });
});
