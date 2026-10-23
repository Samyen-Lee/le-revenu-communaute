import { expect, test } from '@playwright/test';
import { login, uniqueTitle } from './helpers';

test.describe('Publication', () => {
  test('un visiteur est invité à se connecter avant de publier', async ({ page }) => {
    await page.goto('/publier');
    await expect(page).toHaveURL(/\/connexion\?next=%2Fpublier/);

    await page.goto('/discussions/location-meublee-micro-bic-ou-regime-reel');
    await expect(page.getByRole('link', { name: 'Se connecter pour répondre' })).toBeVisible();
    await expect(page.getByLabel('Votre réponse')).toHaveCount(0);
  });

  test('identifiants invalides', async ({ page }) => {
    await page.goto('/connexion');
    await page.getByLabel('Pseudo ou adresse e-mail').fill('Camille_B');
    await page.getByLabel('Mot de passe').fill('mauvais-mot-de-passe');
    await page.getByRole('button', { name: 'Continuer' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toHaveText('Identifiant ou mot de passe incorrect.');
  });

  test('création d’une discussion : erreurs de validation puis redirection', async ({ page }) => {
    await login(page, 'Camille_B', '/publier');
    await expect(page.getByRole('heading', { name: 'Nouvelle publication' })).toBeVisible();

    // Contrôles côté navigateur
    await page.getByLabel('Titre').fill('PEA ?');
    await page.getByRole('button', { name: 'Publier', exact: true }).click();
    await expect(page.getByText('Le titre doit contenir au moins 10 caractères.')).toBeVisible();
    await expect(page.getByText('Le contenu est obligatoire.')).toBeVisible();
    await expect(page.getByText('Choisissez un espace.')).toBeVisible();

    const title = uniqueTitle('Quel ETF choisir pour un PEA ?');
    await page.getByText('Lancer une discussion').click();
    await page.getByLabel('Titre').fill(title);
    await page.getByLabel('Espace').selectOption('bourse');
    await page.getByLabel('Détails').fill('Je compare plusieurs ETF monde éligibles au PEA. Vos critères ?');
    await page.getByRole('button', { name: 'Publier', exact: true }).click();

    await expect(page).toHaveURL(/\/discussions\/quel-etf-choisir-pour-un-pea-test-e2e-\d+/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByRole('main').getByRole('link', { name: 'Camille' }).first()).toBeVisible();

    // La nouvelle discussion apparaît immédiatement dans le fil (cache invalidé par la Server Action)
    await page.goto('/espaces/bourse');
    await expect(page.getByRole('main').getByRole('link', { name: title })).toBeVisible();
  });

  test('publication d’une réponse', async ({ page }) => {
    await login(page, 'Thomas_PEA', '/discussions/or-physique-pieces-ou-lingots-que-privilegiez-vous');
    const heading = page.getByRole('heading', { name: /\d+ réponses?/ });
    const before = Number((await heading.textContent())?.match(/\d+/)?.[0]);

    const reply = `Je privilégie les pièces, plus faciles à revendre. (${Date.now()})`;
    await page.getByLabel('Votre réponse').fill(reply);
    await page.getByRole('button', { name: 'Publier ma réponse' }).click();

    await expect(page.getByText(reply)).toBeVisible();
    await expect(heading).toHaveText(`${before + 1} réponses`);
    await expect(page.getByLabel('Votre réponse')).toHaveValue('');
  });

  test('une réponse vide est refusée', async ({ page }) => {
    await login(page, 'Thomas_PEA', '/discussions/or-physique-pieces-ou-lingots-que-privilegiez-vous');
    await page.getByRole('button', { name: 'Publier ma réponse' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toHaveText('La réponse ne peut pas être vide.');
  });
});
