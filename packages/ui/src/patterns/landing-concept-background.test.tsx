import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingConceptBackground } from "./landing-concept-background";

describe("LandingConceptBackground", () => {
  it("renders the geometric network field and no hero photo", () => {
    const { container } = render(<LandingConceptBackground />);

    expect(
      container.querySelector("[data-testid='landing-network-field']"),
    ).toBeTruthy();
    expect(container.querySelector("[data-kind='nodes']")).toBeTruthy();
    expect(container.querySelector("[data-kind='links']")).toBeTruthy();
    expect(container.querySelector("[data-testid='landing-network-glows']")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });
});
