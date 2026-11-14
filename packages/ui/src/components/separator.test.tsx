import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator";

describe("Separator", () => {
  it("renders horizontal separator by default", () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId("separator");
    expect(separator.getAttribute("data-slot")).toBe("separator");
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("supports vertical orientation", () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    expect(screen.getByTestId("separator").getAttribute("data-orientation")).toBe(
      "vertical",
    );
  });
});
