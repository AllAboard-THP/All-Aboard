import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("renders with alert role", () => {
    render(
      <Alert>
        <AlertTitle>Titre</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Titre")).toBeTruthy();
  });

  it("applies destructive styling", () => {
    render(
      <Alert variant="destructive" data-testid="alert">
        <AlertTitle>Erreur</AlertTitle>
      </Alert>,
    );
    expect(screen.getByTestId("alert").className).toContain("destructive");
  });
});
