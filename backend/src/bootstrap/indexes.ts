/**
 * Index SQL complémentaires pour les requêtes de la communauté (tri, filtre « sans réponse »,
 * lecture par slug). Strapi crée déjà les index des tables de liaison des relations.
 *
 * Créés au bootstrap, après la synchronisation du schéma par Strapi : une migration placée dans
 * database/migrations s'exécuterait avant la création des tables lors du tout premier démarrage.
 * `CREATE INDEX IF NOT EXISTS` est accepté par PostgreSQL et SQLite.
 */
import type { Core } from '@strapi/strapi';

const INDEXES: { name: string; table: string; columns: string[] }[] = [
  { name: 'discussions_created_at_idx', table: 'discussions', columns: ['created_at'] },
  { name: 'discussions_last_activity_at_idx', table: 'discussions', columns: ['last_activity_at'] },
  { name: 'discussions_replies_count_idx', table: 'discussions', columns: ['replies_count'] },
  { name: 'discussions_slug_idx', table: 'discussions', columns: ['slug'] },
  { name: 'replies_created_at_idx', table: 'replies', columns: ['created_at'] },
  { name: 'categories_slug_idx', table: 'categories', columns: ['slug'] },
];

export const ensureIndexes = async (strapi: Core.Strapi) => {
  const knex = strapi.db.connection;
  for (const { name, table, columns } of INDEXES) {
    const placeholders = columns.map(() => '??').join(', ');
    await knex.raw(`CREATE INDEX IF NOT EXISTS ?? ON ?? (${placeholders})`, [name, table, ...columns]);
  }
};
