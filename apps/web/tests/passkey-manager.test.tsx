import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

import { PasskeyManager } from "@/components/features/passkey-manager";
import { renderWithI18n } from "./i18n-test-utils";

const fetchPasskeyCredentials = vi.fn();
const addPasskeyToAccount = vi.fn();
const revokePasskeyCredential = vi.fn();

vi.mock("@/lib/passkey-auth", () => ({
  fetchPasskeyCredentials: (...args: unknown[]) => fetchPasskeyCredentials(...args),
  addPasskeyToAccount: (...args: unknown[]) => addPasskeyToAccount(...args),
  revokePasskeyCredential: (...args: unknown[]) =>
    revokePasskeyCredential(...args),
}));

function renderManager() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <PasskeyManager locale="fr" />
    </QueryClientProvider>,
  );
}

describe("PasskeyManager", () => {
  beforeEach(() => {
    fetchPasskeyCredentials.mockReset();
    addPasskeyToAccount.mockReset();
    revokePasskeyCredential.mockReset();
    fetchPasskeyCredentials.mockResolvedValue({
      items: [
        {
          id: "pk-1",
          credentialId: "cred-1",
          deviceType: "multiDevice",
          backedUp: true,
          createdAt: "2026-06-01T10:00:00.000Z",
        },
      ],
    });
    addPasskeyToAccount.mockResolvedValue(undefined);
    revokePasskeyCredential.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it("lists passkeys and revokes one", async () => {
    renderManager();

    await waitFor(() => {
      expect(screen.getByTestId("passkey-credential-row")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Révoquer" }));

    await waitFor(() => {
      expect(revokePasskeyCredential).toHaveBeenCalled();
      expect(revokePasskeyCredential.mock.calls[0]?.[0]).toBe("pk-1");
    });
  });

  it("adds a passkey from profile", async () => {
    renderManager();

    await waitFor(() => {
      expect(screen.getByTestId("passkey-credential-row")).toBeTruthy();
    });

    const addButton = screen.getByTestId("passkey-add-button");
    expect((addButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(addPasskeyToAccount).toHaveBeenCalled();
    });
  });
});
