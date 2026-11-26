import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

import type { AuthMeResponse } from "@allaboard/types";
import { ProfileForm } from "@/components/features/profile-form";
import { renderWithI18n } from "./i18n-test-utils";

vi.mock("@/components/features/passkey-manager", () => ({
  PasskeyManager: () => <div data-testid="passkey-manager-stub" />,
}));

const fetchMock = vi.fn();

function renderProfileForm(profile?: Partial<AuthMeResponse>) {
  const initialProfile: AuthMeResponse = {
    userId: "uuid-bob",
    role: "student",
    fullName: "Bob Dev",
    displayName: "Bob Dev",
    headline: "Rails learner",
    bio: "Hello",
    notifyOnComment: true,
    notifyOnMessage: false,
    ...profile,
  };
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <ProfileForm initialProfile={initialProfile} subjects={[]} locale="fr" />
    </QueryClientProvider>,
  );
}

describe("ProfileForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ item: { id: "uuid-bob" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("submits profile updates via PATCH /api/users/me", async () => {
    renderProfileForm();

    fireEvent.change(screen.getByLabelText("Accroche"), {
      target: { value: "Next.js fan" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/users/me",
        expect.objectContaining({
          method: "PATCH",
          credentials: "include",
        }),
      );
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body)) as { headline: string };
    expect(body.headline).toBe("Next.js fan");
  });
});
