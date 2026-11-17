import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

import { CertificationWithdrawButton } from "@/components/features/certification-withdraw-button";
import { SkillCertificationForm } from "@/components/features/skill-certification-form";
import { certificationProofUrl } from "@/lib/intuition-proof";
import { mapApiError } from "@/lib/map-api-error";
import { renderWithI18n } from "./i18n-test-utils";

const refresh = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}));

const skills = [
  { id: "skill-rails", slug: "ruby-on-rails", label: "Ruby on Rails", active: true },
  { id: "skill-react", slug: "react", label: "React", active: true },
];

function withQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithI18n(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

function renderForm(props: Partial<React.ComponentProps<typeof SkillCertificationForm>> = {}) {
  return withQueryClient(
    <SkillCertificationForm
      recipientId="user-1"
      recipientName="Ada"
      skills={skills}
      {...props}
    />,
  );
}

describe("SkillCertificationForm", () => {
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

  it("says so when every skill is already validated", () => {
    renderForm({ skills: [] });
    expect(screen.getByTestId("certification-all-given")).toBeTruthy();
    expect(screen.queryByTestId("certification-open")).toBeNull();
  });

  it("posts the chosen skill and trimmed comment, then refreshes", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ item: { id: "cert-1" } }), { status: 201 }),
    );
    renderForm();

    fireEvent.click(screen.getByTestId("certification-open"));
    const submit = screen.getByTestId("certification-submit") as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    fireEvent.change(screen.getByTestId("certification-skill"), {
      target: { value: "skill-react" },
    });
    fireEvent.change(screen.getByTestId("certification-comment"), {
      target: { value: "  Patient  " },
    });
    fireEvent.click(submit);

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/users/user-1/certifications");
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      skillId: "skill-react",
      comment: "Patient",
    });
    expect(screen.queryByTestId("certification-form")).toBeNull();
  });

  it("shows the translated error on 409 already_attested", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "already_attested" }), { status: 409 }),
    );
    renderForm();

    fireEvent.click(screen.getByTestId("certification-open"));
    fireEvent.change(screen.getByTestId("certification-skill"), {
      target: { value: "skill-rails" },
    });
    fireEvent.click(screen.getByTestId("certification-submit"));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("déjà donné un +1");
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe("CertificationWithdrawButton", () => {
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

  it("asks for confirmation before sending DELETE", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    withQueryClient(
      <CertificationWithdrawButton recipientId="user-1" certificationId="cert-1" />,
    );

    fireEvent.click(screen.getByTestId("certification-withdraw"));
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("certification-withdraw-confirm"));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/users/user-1/certifications/cert-1");
    expect((init as RequestInit).method).toBe("DELETE");
  });
});

describe("mapApiError for certifications", () => {
  it("maps the certification codes", () => {
    expect(mapApiError({ status: 403, body: { error: "not_eligible" } })).toBe("notEligible");
    expect(mapApiError({ status: 422, body: { error: "comment_rejected" } })).toBe("commentRejected");
    expect(mapApiError({ status: 429 })).toBe("rateLimited");
  });
});

describe("certification proof", () => {
  afterEach(() => {
    cleanup();
  });

  it("links the +1 transaction on the testnet explorer", () => {
    const txHash = `0x${"ab".repeat(32)}`;
    expect(
      certificationProofUrl({
        network: "intuition-testnet",
        attestationTripleId: `0x${"1".repeat(64)}`,
        claimTripleId: `0x${"2".repeat(64)}`,
        txHash,
        publishedAt: "2026-11-17T10:00:00.000Z",
      }),
    ).toBe(`https://testnet.explorer.intuition.systems/tx/${txHash}`);
  });

  it("gives no link without a valid transaction hash", () => {
    const base = {
      network: "intuition-testnet" as const,
      attestationTripleId: `0x${"1".repeat(64)}`,
      claimTripleId: `0x${"2".repeat(64)}`,
      publishedAt: "2026-11-17T10:00:00.000Z",
    };
    expect(certificationProofUrl(base)).toBeNull();
    expect(certificationProofUrl({ ...base, txHash: "javascript:alert(1)" })).toBeNull();
  });

  it("warns that a published +1 stays on the chain when withdrawn", () => {
    withQueryClient(
      <CertificationWithdrawButton
        recipientId="user-1"
        certificationId="cert-1"
        published
      />,
    );
    fireEvent.click(screen.getByTestId("certification-withdraw"));
    expect(screen.getByText(/restera sur la chaîne/)).toBeTruthy();
  });
});
