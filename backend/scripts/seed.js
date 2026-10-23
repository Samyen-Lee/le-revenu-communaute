/**
 * Réinitialise les données de démonstration (catégories, membres de démo, discussions, réponses).
 * À lancer Strapi arrêté :  npm run seed:reset
 * Le seed lui-même est dans src/seed : il s'exécute dans le bootstrap de Strapi.
 */
'use strict';

const { compileStrapi, createStrapi } = require('@strapi/strapi');

process.env.SEED_DEMO_DATA = 'true';
process.env.SEED_RESET = process.argv.includes('--reset') ? 'true' : 'false';
process.env.FRONTEND_REVALIDATE_URL = '';

(async () => {
  const app = await createStrapi(await compileStrapi()).load();
  const count = await app.db.query('api::discussion.discussion').count();
  app.log.info(`[seed] Terminé : ${count} discussions en base.`);
  await app.destroy();
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
