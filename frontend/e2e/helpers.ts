import { expect, type Page } from '@playwright/test';

export const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'Communaute2026!';

export async function login(page: Page, username = 'Camille_B', next = '/') {
  await page.goto(`/connexion?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Pseudo ou adresse e-mail').fill(username);
  await page.getByLabel('Mot de passe').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('button', { name: /Mon compte/ })).toBeVisible();
}

export const uniqueTitle = (prefix: string) => `${prefix} (test e2e ${Date.now()})`;
