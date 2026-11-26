import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("renders with data-slot input", () => {
    render(<Input aria-label="Email" placeholder="…" />);
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("data-slot")).toBe("input");
    expect(input.getAttribute("placeholder")).toBe("…");
  });

  it("supports aria-invalid", () => {
    render(<Input aria-label="Email" aria-invalid />);
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });
});
