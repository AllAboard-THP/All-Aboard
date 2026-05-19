import type { Page } from "@playwright/test";

/** Accepte les CGU (localStorage) pour ne pas bloquer les parcours R1, R2, R4… */
export async function acceptCguInStorage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("allaboard-cgu-accepted", "1");
  });
}

/** Réinitialise les CGU pour le parcours R3. */
export async function resetCguInStorage(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem("allaboard-cgu-accepted");
  });
}
