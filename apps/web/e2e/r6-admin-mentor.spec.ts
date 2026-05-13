import { test } from "@playwright/test";

test.describe("R6 — Mentor / admin", () => {
  test("menus et dashboard sans 500", async () => {
    test.skip(
      true,
      "Routes mentor / admin non livrées — retirer ce skip quand §8.8 est implémenté.",
    );
  });
});
