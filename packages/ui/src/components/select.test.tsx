import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select", () => {
  it("renders trigger with selected value", () => {
    render(
      <Select defaultValue="javascript">
        <SelectTrigger aria-label="Tag">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="rails">Rails</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Tag" })).toBeTruthy();
    expect(screen.getByText("JavaScript")).toBeTruthy();
  });

  it("exposes data-slot on root via trigger", () => {
    render(
      <Select defaultValue="help">
        <SelectTrigger data-testid="select-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="help">Aide</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByTestId("select-trigger").getAttribute("data-slot")).toBe(
      "select-trigger",
    );
  });
});
