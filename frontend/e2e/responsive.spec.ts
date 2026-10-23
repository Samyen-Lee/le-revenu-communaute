import { expect, test } from '@playwright/test';

test('mobile : barre basse, filtre par espaces et pas de défilement horizontal', async ({ page }) => {
  await page.goto('/');
  const bottomNav = page.getByRole('navigation', { name: 'Navigation mobile' });
  await expect(bottomNav).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeHidden();

  await page.getByRole('navigation', { name: 'Espaces' }).getByRole('link', { name: 'Retraite' }).click();
  await expect(page).toHaveURL(/\/espaces\/retraite$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Retraite' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
