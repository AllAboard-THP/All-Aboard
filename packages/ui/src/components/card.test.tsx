import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  it("renders card structure", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Feed communautaire</CardTitle>
          <CardDescription>Aucune demande pour l&apos;instant</CardDescription>
        </CardHeader>
        <CardContent>Contenu</CardContent>
      </Card>,
    );
    expect(screen.getByTestId("card").getAttribute("data-slot")).toBe("card");
    expect(screen.getByText("Feed communautaire")).toBeTruthy();
    expect(screen.getByText("Contenu")).toBeTruthy();
  });
});
