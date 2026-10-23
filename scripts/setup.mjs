/**
 * Prépare le projet en une commande : fichiers .env avec secrets générés, dépendances,
 * et base SQLite de démonstration.
 *
 *   npm run setup               → Strapi sur SQLite (aucune installation requise)
 *   npm run setup -- --postgres → Strapi sur PostgreSQL (docker compose up -d postgres)
 *
 * Les fichiers .env existants ne sont jamais écrasés.
 */
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const usePostgres = process.argv.includes('--postgres');
const secret = () => randomBytes(24).toString('base64url');
const revalidateSecret = secret();

const fromExample = (example, target, transform) => {
  const targetPath = path.join(root, target);
  if (existsSync(targetPath)) {
    console.log(`• ${target} existe déjà : conservé`);
    return;
  }
  writeFileSync(targetPath, transform(readFileSync(path.join(root, example), 'utf8')));
  console.log(`• ${target} créé`);
};

const withSecrets = (content) =>
  content
    .replace(/^APP_KEYS=.*$/m, `APP_KEYS="${secret()},${secret()}"`)
    .replace(/^REVALIDATE_SECRET=.*$/m, `REVALIDATE_SECRET=${revalidateSecret}`)
    .replace(/=tobemodified$/gm, () => `=${secret()}`);

const useSqlite = (content) =>
  content
    .replace(/^DATABASE_CLIENT=postgres$/m, '# DATABASE_CLIENT=postgres')
    .replace(/^# DATABASE_CLIENT=sqlite$/m, 'DATABASE_CLIENT=sqlite')
    .replace(/^# DATABASE_FILENAME=/m, 'DATABASE_FILENAME=');

console.log('\n1. Variables d’environnement');
fromExample('backend/.env.example', 'backend/.env', (c) => {
  const env = withSecrets(c).replace(/^SEED_ADMIN_PASSWORD=$/m, 'SEED_ADMIN_PASSWORD=AdminDemo2026!');
  return usePostgres ? env : useSqlite(env);
});
fromExample('frontend/.env.example', 'frontend/.env.local', (c) =>
  c.replace(/^REVALIDATE_SECRET=.*$/m, `REVALIDATE_SECRET=${revalidateSecret}`),
);
fromExample('.env.example', '.env', withSecrets);

console.log('\n2. Dépendances');
// La racine porte `concurrently`, utilisé par `npm run dev`.
for (const dir of ['.', 'backend', 'frontend']) {
  console.log(`• npm install (${dir === '.' ? 'racine' : dir})…`);
  execSync('npm install', { cwd: path.join(root, dir), stdio: 'inherit' });
}

if (!usePostgres) {
  console.log('\n3. Base SQLite de démonstration');
  const target = path.join(root, 'backend/.tmp/data.db');
  if (existsSync(target)) {
    console.log('• backend/.tmp/data.db existe déjà : conservée');
  } else {
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(root, 'backend/database/communaute-demo.db'), target);
    console.log('• backend/.tmp/data.db créée à partir de backend/database/communaute-demo.db');
  }
}

console.log(`
Prêt. Lancez :  npm run dev
  • Site       http://localhost:3000
  • Admin      http://localhost:1337/admin   (admin@demo.lerevenu.test / AdminDemo2026!)
  • Membres    Camille_B, Thomas_PEA, LaRedaction…  (mot de passe : Communaute2026!)
${usePostgres ? '\nPostgreSQL : démarrez d’abord la base avec  docker compose up -d postgres\n' : ''}`);
