import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

import { PasskeyRegisterForm } from "@/components/features/passkey-register-form";
import { renderWithI18n } from "./i18n-test-utils";

const registerPasskey = vi.fn();
const push = vi.fn();
const refresh = vi.fn();

vi.mock("@/lib/passkey-auth", () => ({
  registerPasskey: (...args: unknown[]) => registerPasskey(...args),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
  useRouter: () => ({ push, refresh }),
}));

function renderRegisterForm(returnTo = "/help/new") {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <PasskeyRegisterForm returnTo={returnTo} />
    </QueryClientProvider>,
  );
}

describe("PasskeyRegisterForm", () => {
  beforeEach(() => {
    registerPasskey.mockReset();
    push.mockReset();
    refresh.mockReset();
    registerPasskey.mockResolvedValue({
      ok: true,
      verified: true,
      userId: "user-1",
      role: "student",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("requires full name and CGU before submit", () => {
    renderRegisterForm();
    const submit = screen.getByRole("button", { name: "Créer ma passkey" });
    expect(submit.hasAttribute("disabled")).toBe(true);
  });

  it("calls registerPasskey and redirects on success", async () => {
    renderRegisterForm();

    fireEvent.change(screen.getByLabelText("Nom complet"), {
      target: { value: "Alice Test" },
    });
    fireEvent.click(screen.getByTestId("register-accept-cgu"));
    fireEvent.click(screen.getByRole("button", { name: "Créer ma passkey" }));

    await waitFor(() => {
      expect(registerPasskey).toHaveBeenCalledWith({
        fullName: "Alice Test",
        acceptCgu: true,
      });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/help/new");
    });
  });
});
