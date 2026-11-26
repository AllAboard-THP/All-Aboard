import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with data-slot", () => {
    render(<Skeleton data-testid="skeleton" className="h-4 w-24" />);
    expect(screen.getByTestId("skeleton").getAttribute("data-slot")).toBe(
      "skeleton",
    );
  });
});
