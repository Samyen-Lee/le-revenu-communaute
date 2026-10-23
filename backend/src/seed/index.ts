/**
 * Initialisation des données de démonstration.
 *
 * - Lancée automatiquement au démarrage si la base ne contient aucune catégorie
 *   (désactivable avec SEED_DEMO_DATA=false).
 * - `npm run seed:reset` supprime puis recrée les données de démonstration.
 *
 * Les contenus passent par le Document Service (relations, validations, middlewares) ;
 * seules les dates sont ensuite réécrites via le Query Engine pour simuler un historique.
 */
import type { Core } from '@strapi/strapi';
import { categories, discussions, emailOf, users } from './data';

export const DEMO_EMAIL_DOMAIN = '@demo.lerevenu.test';
export const DEFAULT_DEMO_PASSWORD = 'Communaute2026!';

const CATEGORY = 'api::category.category';
const DISCUSSION = 'api::discussion.discussion';
const REPLY = 'api::reply.reply';
const USER = 'plugin::users-permissions.user';

const MINUTE = 60_000;

type DiscussionService = {
  generateUniqueSlug(title: string): Promise<string>;
  syncStats(documentId: string): Promise<void>;
};

const setDates = (strapi: Core.Strapi, uid: typeof DISCUSSION | typeof REPLY, documentId: string, date: Date) =>
  strapi.db.query(uid).updateMany({
    where: { documentId },
    data: { createdAt: date, updatedAt: date, publishedAt: date },
  });

const wipeDemoData = async (strapi: Core.Strapi) => {
  for (const uid of [REPLY, DISCUSSION, CATEGORY] as const) {
    const documents = await strapi.documents(uid).findMany({ fields: ['documentId'] as any, limit: -1 } as any);
    for (const { documentId } of documents) await strapi.documents(uid).delete({ documentId });
  }
  const demoUsers = await strapi.db.query(USER).findMany({ where: { email: { $endsWith: DEMO_EMAIL_DOMAIN } } });
  for (const { documentId } of demoUsers) await strapi.documents(USER).delete({ documentId });
};

/**
 * Réentrant : catégories et membres déjà présents sont réutilisés (recherche par slug / pseudo),
 * les discussions ne sont créées que si la base n'en contient aucune.
 */
export const seedDemoData = async (strapi: Core.Strapi, { reset = false } = {}) => {
  const alreadySeeded = (await strapi.db.query(DISCUSSION).count()) > 0;
  if (alreadySeeded && !reset) return false;
  if (reset) await wipeDemoData(strapi);

  const now = Date.now();
  const password = process.env.DEMO_USER_PASSWORD || DEFAULT_DEMO_PASSWORD;
  const discussionService = strapi.service(DISCUSSION) as unknown as DiscussionService;

  const categoryIds = new Map<string, string>();
  for (const [position, category] of categories.entries()) {
    const existing = await strapi.db.query(CATEGORY).findOne({ where: { slug: category.slug } });
    const created = existing ?? (await strapi.documents(CATEGORY).create({ data: { ...category, position } as any }));
    categoryIds.set(category.slug, created.documentId);
  }

  const authenticated = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });
  const userIds = new Map<string, string>();
  for (const user of users) {
    const existing = await strapi.db.query(USER).findOne({ where: { username: user.username } });
    if (existing) {
      // Compte déjà présent : on remet son profil de démonstration à jour (jamais son mot de passe).
      const { username: _username, ...profile } = user;
      await strapi.db.query(USER).update({
        where: { id: existing.id },
        data: { ...profile, memberType: user.memberType ?? 'member', isSubscriber: Boolean(user.isSubscriber) },
      });
      userIds.set(user.username, existing.documentId);
      continue;
    }
    const created = await strapi.plugin('users-permissions').service('user').add({
      ...user,
      memberType: user.memberType ?? 'member',
      email: emailOf(user.username),
      password,
      provider: 'local',
      confirmed: true,
      blocked: false,
      role: authenticated.id,
    });
    userIds.set(user.username, created.documentId);
  }

  for (const seed of discussions) {
    const minutesAgo = seed.hoursAgo * 60;
    const publishedAt = new Date(now - minutesAgo * MINUTE);

    const discussion = await strapi.documents(DISCUSSION).create({
      data: {
        title: seed.title,
        content: seed.content,
        type: seed.type,
        slug: await discussionService.generateUniqueSlug(seed.title),
        author: userIds.get(seed.author),
        category: categoryIds.get(seed.category),
        repliesCount: 0,
        lastActivityAt: publishedAt,
      } as any,
    });
    await setDates(strapi, DISCUSSION, discussion.documentId, publishedAt);

    // Réponses étalées entre la publication et maintenant, comme dans la maquette.
    const count = seed.replies.length;
    for (const [index, [author, content]] of seed.replies.entries()) {
      const replyMinutesAgo = Math.round(minutesAgo - (minutesAgo * (index + 1)) / (count + 1.4));
      const reply = await strapi.documents(REPLY).create({
        data: { content, author: userIds.get(author), discussion: discussion.documentId } as any,
      });
      await setDates(strapi, REPLY, reply.documentId, new Date(now - replyMinutesAgo * MINUTE));
    }
    await discussionService.syncStats(discussion.documentId);
  }

  strapi.log.info(
    `[seed] ${categories.length} catégories, ${users.length} membres et ${discussions.length} discussions créés.`
  );
  return true;
};
