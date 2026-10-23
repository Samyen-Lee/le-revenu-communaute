import path from 'node:path';
import { createStrapi, type Core } from '@strapi/strapi';
import request from 'supertest';

let instance: Core.Strapi | undefined;

/** Démarre Strapi (bootstrap complet : permissions, index, seed) et monte le serveur HTTP. */
export async function setupStrapi() {
  if (!instance) {
    const appDir = path.resolve(__dirname, '../..');
    instance = await createStrapi({ appDir, distDir: path.join(appDir, '.tmp/test-dist') }).load();
    instance.server.mount();
  }
  return instance;
}

export async function teardownStrapi() {
  if (!instance) return;
  await instance.destroy();
  instance = undefined;
}

export const api = () => request(instance!.server.httpServer);

export async function findUser(username: string) {
  const user = await instance!.db.query('plugin::users-permissions.user').findOne({ where: { username } });
  if (!user) throw new Error(`Utilisateur de démo introuvable : ${username}`);
  return user as { id: number; documentId: string; username: string };
}

/** JWT Users & Permissions pour un membre de démonstration (sans passer par /auth/local). */
export async function tokenFor(username: string) {
  const user = await findUser(username);
  return instance!.plugin('users-permissions').service('jwt').issue({ id: user.id }) as string;
}

export const strapi = () => instance!;
