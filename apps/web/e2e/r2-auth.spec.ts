import { test } from "@playwright/test";

test.describe("R2 — Auth", () => {
  test("formulaires et session (parcours complet)", async () => {
    test.skip(
      true,
      "Pages auth App Router non livrées — retirer ce skip quand login / register / erreurs sont implémentés (plan §8.4).",
    );
  });
});
