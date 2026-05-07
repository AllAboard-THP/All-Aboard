import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HealthPage from "../app/health/page";

describe("HealthPage", () => {
  it("renders ok", () => {
    render(<HealthPage />);
    expect(screen.getByTestId("health-status").textContent).toBe("ok");
  });
});
