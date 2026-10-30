import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "./label";

describe("Label", () => {
  it("renders label text", () => {
    render(<Label htmlFor="title">Titre</Label>);
    expect(screen.getByText("Titre")).toBeTruthy();
  });

  it("associates with form control via htmlFor", () => {
    render(<Label htmlFor="title">Titre</Label>);
    expect(screen.getByText("Titre").getAttribute("for")).toBe("title");
  });
});
