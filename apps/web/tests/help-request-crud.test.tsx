import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

import { HelpRequestEditForm } from "@/components/features/help-request-edit-form";
import { HelpRequestOwnerActions } from "@/components/features/help-request-owner-actions";
import { HelpRequestDetailClient } from "@/components/features/help-request-detail-client";
import { renderWithI18n } from "./i18n-test-utils";

const updateHelpRequest = vi.fn();
const deleteHelpRequest = vi.fn();
const updateResponse = vi.fn();
const deleteResponse = vi.fn();

vi.mock("@/lib/help-request-client", () => ({
  updateHelpRequest: (...args: unknown[]) => updateHelpRequest(...args),
  deleteHelpRequest: (...args: unknown[]) => deleteHelpRequest(...args),
  updateResponse: (...args: unknown[]) => updateResponse(...args),
  deleteResponse: (...args: unknown[]) => deleteResponse(...args),
}));

const mockPush = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: mockPush }),
}));

const authorId = "user-author-uuid";
const requestId = "req-1";

const initialItem = {
  id: requestId,
  title: "Original title",
  authorId,
  createdAt: "2026-06-01T10:00:00.000Z",
  tags: ["rails", "mentor"],
};

const initialDetail = {
  item: initialItem,
  responses: [
    {
      id: "resp-1",
      helpRequestId: requestId,
      body: "First reply",
      authorId,
      createdAt: "2026-06-01T11:00:00.000Z",
    },
    {
      id: "resp-2",
      helpRequestId: requestId,
      body: "Other user reply",
      authorId: "other-user",
      createdAt: "2026-06-01T12:00:00.000Z",
    },
  ],
};

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithI18n(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

function mockAuthMe(userId: string | null) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/auth/me")) {
        if (!userId) {
          return new Response(null, { status: 401 });
        }
        return Response.json({ userId, role: "user" });
      }
      if (url.includes("/api/help-requests/")) {
        return Response.json(initialDetail);
      }
      return new Response(null, { status: 404 });
    }),
  );
}

describe("HelpRequestEditForm", () => {
  beforeEach(() => {
    updateHelpRequest.mockReset();
    mockPush.mockReset();
    updateHelpRequest.mockResolvedValue({ item: initialItem });
    mockAuthMe(authorId);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("submits updated title and tags for the author", async () => {
    renderWithQuery(
      <HelpRequestEditForm requestId={requestId} initialItem={initialItem} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("help-request-edit-form")).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText("Titre de la demande"), {
      target: { value: "Updated title" },
    });
    fireEvent.change(screen.getByLabelText("Tags (optionnel, séparés par virgule)"), {
      target: { value: "nextjs" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => {
      expect(updateHelpRequest).toHaveBeenCalledWith(requestId, {
        title: "Updated title",
        tags: ["nextjs"],
      });
      expect(mockPush).toHaveBeenCalledWith(`/requests/${requestId}`);
    });
  });

  it("shows forbidden state for non-author", async () => {
    mockAuthMe("other-user");
    renderWithQuery(
      <HelpRequestEditForm requestId={requestId} initialItem={initialItem} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("help-edit-forbidden")).toBeTruthy();
    });
  });
});

describe("HelpRequestOwnerActions", () => {
  beforeEach(() => {
    deleteHelpRequest.mockReset();
    mockPush.mockReset();
    deleteHelpRequest.mockResolvedValue(undefined);
    mockAuthMe(authorId);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("deletes request after confirmation", async () => {
    renderWithQuery(
      <HelpRequestOwnerActions requestId={requestId} authorId={authorId} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("help-request-owner-actions")).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId("help-request-delete-button"));
    fireEvent.click(screen.getByTestId("help-request-delete-confirm-button"));

    await waitFor(() => {
      expect(deleteHelpRequest).toHaveBeenCalledWith(requestId);
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("renders nothing for non-author", async () => {
    mockAuthMe("other-user");
    renderWithQuery(
      <HelpRequestOwnerActions requestId={requestId} authorId={authorId} />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId("help-request-owner-actions")).toBeNull();
    });
  });
});

describe("HelpRequestDetailClient response CRUD", () => {
  beforeEach(() => {
    updateResponse.mockReset();
    deleteResponse.mockReset();
    updateResponse.mockResolvedValue({
      item: { ...initialDetail.responses![0], body: "Edited reply" },
    });
    deleteResponse.mockResolvedValue(undefined);
    mockAuthMe(authorId);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("edits an owned response", async () => {
    renderWithQuery(
      <HelpRequestDetailClient
        requestId={requestId}
        initialDetail={initialDetail}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("response-item-owned")).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId("response-edit-button"));
    fireEvent.change(screen.getByTestId("response-edit-textarea"), {
      target: { value: "Edited reply" },
    });
    fireEvent.click(screen.getByTestId("response-save-button"));

    await waitFor(() => {
      expect(updateResponse).toHaveBeenCalledWith(requestId, "resp-1", {
        body: "Edited reply",
      });
    });
  });

  it("deletes an owned response after confirmation", async () => {
    renderWithQuery(
      <HelpRequestDetailClient
        requestId={requestId}
        initialDetail={initialDetail}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("response-delete-button")).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId("response-delete-button"));
    fireEvent.click(screen.getByTestId("response-delete-confirm-button"));

    await waitFor(() => {
      expect(deleteResponse).toHaveBeenCalledWith(requestId, "resp-1");
    });
  });
});
