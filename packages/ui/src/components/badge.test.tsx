import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders badge text", () => {
    render(<Badge>mentor</Badge>);
    expect(screen.getByText("mentor")).toBeTruthy();
  });

  it("applies outline variant", () => {
    render(
      <Badge variant="outline" data-testid="badge">
        rails
      </Badge>,
    );
    expect(screen.getByTestId("badge").getAttribute("data-variant")).toBe(
      "outline",
    );
  });
});
