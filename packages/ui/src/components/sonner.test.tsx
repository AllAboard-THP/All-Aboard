import { render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "./sonner";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

describe("Toaster", () => {
  it("displays a toast notification", async () => {
    render(<Toaster />);
    toast.success("Demande publiée");
    await waitFor(() => {
      expect(screen.getByText("Demande publiée")).toBeTruthy();
    });
  });
});
