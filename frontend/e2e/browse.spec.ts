import { expect, test } from '@playwright/test';

test.describe('Consultation des discussions', () => {
  test('l’accueil affiche les discussions issues de Strapi', async ({ page }) => {
    await page.goto('/');
    const cards = page.getByRole('main').getByRole('article');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBe(10); // première page

    // Chaque carte présente le titre, l'espace, l'auteur, le nombre de réponses et la date
    for (const card of (await cards.all()).slice(0, 3)) {
      await expect(card.getByRole('heading', { level: 3 }).getByRole('link')).toHaveAttribute('href', /^\/discussions\//);
      await expect(card.getByRole('link').first()).toHaveAttribute('href', /^\/espaces\//);
      await expect(card.locator('b').first()).not.toBeEmpty();
      await expect(card.getByTitle('Réponses')).toContainText(/\d+/);
      await expect(card.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/);
    }

    await page.goto('/?tri=reponses');
    await expect(cards.first().getByRole('link', { name: /Question de la semaine/ })).toBeVisible();
  });

  test('filtre par espace et navigation vers le détail', async ({ page }) => {
    await page.goto('/espaces/assurance-vie');
    await expect(page.getByRole('heading', { level: 1, name: 'Assurance-vie' })).toBeVisible();

    const cards = page.getByRole('main').getByRole('article');
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      await expect(card.getByRole('link', { name: 'Assurance-vie', exact: true })).toBeVisible();
    }

    await page.getByRole('link', { name: 'Assurance-vie après 70 ans : est-ce encore intéressant ?' }).click();
    await expect(page).toHaveURL(/\/discussions\/assurance-vie-apres-70-ans-est-ce-encore-interessant$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Assurance-vie après 70 ans : est-ce encore intéressant ?');
    await expect(page.getByRole('heading', { name: /\d+ réponses?/ })).toBeVisible();
    await expect(page.getByText('Réponse de la rédaction')).toBeVisible();
  });

  test('tri par date de publication (plus anciennes d’abord)', async ({ page }) => {
    await page.goto('/?tri=ancien');
    const cards = page.getByRole('main').getByRole('article');
    await expect(cards.first()).toBeVisible(); // le fil arrive en streaming
    const dates = await cards
      .locator('time')
      .evaluateAll((nodes) => nodes.map((node) => new Date(node.getAttribute('datetime') ?? '').getTime()));
    expect(dates.length).toBeGreaterThan(2);
    expect([...dates].sort((a, b) => a - b)).toEqual(dates);
  });

  test('recherche plein texte', async ({ page }) => {
    await page.goto('/recherche?q=SCPI');
    await expect(page.getByText(/résultats? pour « SCPI »/)).toBeVisible();
    await expect(page.getByRole('link', { name: /SCPI : vous avez renforcé/ })).toBeVisible();
  });

  test('une discussion inconnue renvoie la page introuvable', async ({ page }) => {
    await page.goto('/discussions/cette-discussion-n-existe-pas');
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  });
});
