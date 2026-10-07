import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with data-slot textarea", () => {
    render(<Textarea aria-label="Description" placeholder="Décrivez votre besoin" />);
    const textarea = screen.getByLabelText("Description");
    expect(textarea.getAttribute("data-slot")).toBe("textarea");
    expect(textarea.getAttribute("placeholder")).toBe("Décrivez votre besoin");
  });

  it("supports aria-invalid", () => {
    render(<Textarea aria-label="Description" aria-invalid />);
    expect(screen.getByLabelText("Description").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });
});
