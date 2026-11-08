import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingConceptBackground } from "./landing-concept-background";

describe("LandingConceptBackground", () => {
  it("renders the cell field and no hero photo", () => {
    const { container } = render(<LandingConceptBackground />);

    expect(
      container.querySelector("[data-testid='landing-cell-field']"),
    ).toBeTruthy();
    expect(container.querySelectorAll("[data-kind='cell']")).toHaveLength(5);
    expect(container.querySelector("img")).toBeNull();
  });
});
