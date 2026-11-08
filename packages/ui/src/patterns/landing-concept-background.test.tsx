import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingConceptBackground } from "./landing-concept-background";

describe("LandingConceptBackground", () => {
  it("renders the geometric network field and no hero photo", () => {
    const { container } = render(<LandingConceptBackground />);

    expect(
      container.querySelector("[data-testid='landing-network-field']"),
    ).toBeTruthy();
    expect(container.querySelectorAll("[data-kind='pod']")).toHaveLength(3);
    expect(container.querySelector("img")).toBeNull();
  });
});
