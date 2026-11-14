import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SubjectIcon } from "@/components/features/subject-icon";

describe("SubjectIcon", () => {
  it("renders icon abbreviation from icon field", () => {
    render(
      <SubjectIcon icon="js" accentColor="#f7df1e" name="JavaScript" />,
    );
    expect(screen.getByText("JS")).toBeTruthy();
  });

  it("falls back to name when icon is empty", () => {
    render(
      <SubjectIcon icon="" accentColor="#cc342d" name="Ruby" />,
    );
    expect(screen.getByText("RU")).toBeTruthy();
  });
});
