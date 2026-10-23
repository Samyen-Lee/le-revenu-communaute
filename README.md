# Communauté Le Revenu

Espace communautaire du Revenu : les lecteurs consultent les discussions par espace, posent des questions et répondent.

- **Frontend** : Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4
- **Backend** : Strapi 5.59 en TypeScript, API REST, Users & Permissions
- **Base de données** : PostgreSQL (cible) ou SQLite (lancement sans installation)

```
le-revenu-communaute/
├── backend/            Strapi v5 : content types, controllers, services, policies, seed, tests Jest
├── frontend/           Next.js : pages App Router, composants, client Strapi typé, tests Vitest + Playwright
├── docker-compose.yml  PostgreSQL + Strapi + Next.js
└── scripts/setup.mjs   préparation en une commande (.env, dépendances, base de démo)
```

---

## 1. Démarrage rapide (SQLite, aucune installation)

Prérequis : **Node.js 20 à 24** et npm.

```bash
npm run setup     # crée les .env (secrets générés), installe les dépendances, copie la base SQLite de démo
npm run dev       # lance Strapi (1337) et Next.js (3000)
```

Au tout premier lancement, Strapi construit son interface d'administration (environ 20 secondes) : si le site affiche « momentanément indisponible », attendre la ligne `Strapi started successfully` puis cliquer sur « Réessayer ».

| | URL | Accès |
|---|---|---|
| Site | http://localhost:3000 | visiteur, ou membre via « Se connecter » |
| Admin Strapi | http://localhost:1337/admin | `admin@demo.lerevenu.test` / `AdminDemo2026!` |
| API | http://localhost:1337/api/discussions | publique en lecture |

**Membres de démonstration** (mot de passe commun `Communaute2026!`) : `Camille_B`, `Thomas_PEA`, `LaRedaction` (compte rédaction), `Sandrine_CGP` (experte vérifiée)… La page de connexion propose ces comptes en un clic.

La base SQLite de démonstration est fournie dans `backend/database/communaute-demo.db` (copiée vers `backend/.tmp/data.db` par `npm run setup`). Elle est identique à ce que produit le seed automatique.

## 2. Avec PostgreSQL

```bash
npm run setup -- --postgres     # backend/.env configuré pour PostgreSQL
docker compose up -d postgres   # PostgreSQL 16 sur localhost:5432 (POSTGRES_HOST_PORT pour changer de port)
npm run dev
```

Sans Docker, tout PostgreSQL ≥ 12 convient : renseigner `DATABASE_*` dans `backend/.env`. Au premier démarrage, Strapi crée le schéma, les index et les données de démonstration.

## 3. Tout en conteneurs (Docker Compose)

```bash
cp .env.example .env    # ou `npm run setup`, qui génère les secrets
docker compose up --build
```

Le front attend que Strapi soit sain (healthcheck) avant de lancer `next build` : avec Cache Components, le build prérend le cadre des pages à partir des données de l'API.

## 4. Commandes utiles

| Commande (à la racine) | Rôle |
|---|---|
| `npm run dev` | Strapi + Next.js en développement |
| `npm test` | tests backend (Jest, 42 tests) puis frontend (Vitest, 14 tests) |
| `npm run test:e2e` | tests de bout en bout Playwright (11 tests, serveurs lancés ou démarrés automatiquement) |
| `npm run seed:reset` | Strapi arrêté : réinitialise les données de démonstration (dates relatives recalculées) |
| `npm run lint` | ESLint + vérification TypeScript |

Avant le premier `npm run test:e2e` : `npx --prefix frontend playwright install chromium`.

---

## 5. Architecture backend (Strapi v5)

### Modèle de données

| Content type | Champs | Relations |
|---|---|---|
| **User** (Users & Permissions, étendu) | `displayName`, `bio`, `avatarColor`, `memberType` (member, redaction, expert, moderator), `expertTitle`, `isSubscriber` | `discussions`, `replies` |
| **Category** | `name` (unique), `slug` (uid), `description`, `icon` (énumération), `color`, `position` | `discussions` |
| **Discussion** | `title` (10 à 150 caractères), `slug` (uid), `content` (obligatoire), `type` (question, discussion), `repliesCount`, `lastActivityAt` | `author` → User, `category` → Category, `replies` → Reply |
| **Reply** | `content` (2 à 5 000 caractères) | `author` → User, `discussion` → Discussion |

Les schémas sont dans `backend/src/api/*/content-types/*/schema.json` et `backend/src/extensions/users-permissions/content-types/user/schema.json`. Draft & Publish est désactivé : une contribution est publiée dès sa création.

### API

| Méthode et route | Accès | Rôle |
|---|---|---|
| `GET /api/categories` | public | espaces (natif Strapi) |
| `GET /api/discussions?category=&author=&type=&unanswered=&q=&sort=&page=&pageSize=` | public | liste paginée, filtrée et triée côté serveur |
| `GET /api/discussions/:slugOuDocumentId` | public | détail |
| `POST /api/discussions` | authentifié | création `{ data: { title, content, type, category } }` |
| `GET /api/replies?discussion=<documentId>&page=&pageSize=` | public | réponses d'une discussion, de la plus ancienne à la plus récente |
| `POST /api/replies` | authentifié | réponse `{ data: { content, discussion } }` |
| `GET /api/members/:username` | public | profil public et statistiques |
| `POST /api/auth/local` | public | connexion (natif Users & Permissions) |

Valeurs de `sort` : `publishedAt:desc` (défaut), `publishedAt:asc`, `lastActivityAt:desc`, `repliesCount:desc`. Les réponses suivent le format Strapi `{ data, meta: { pagination } }` et les erreurs le format `{ error: { status, name, message, details } }`.

### Où vit la logique métier

- **Routes** (`routes/*.ts`) : core routers limités aux actions utiles (`only`). Pas de `PUT` ni de `DELETE` publics (405).
- **Policies globales** (`src/policies/`) :
  - `is-authenticated` : garde-fou explicite sur les écritures, même si un administrateur ouvrait la permission au rôle Public ;
  - `prevent-author-spoofing` : 403 si la requête désigne un autre auteur, quelle que soit la forme utilisée (id, documentId, `connect`, `set`…).
- **Controllers** : valident l'entrée, puis délèguent au service. **L'auteur est toujours celui du jeton** (`ctx.state.user`), jamais une donnée de la requête.
- **Services** : Document Service API (`strapi.documents()`) pour les lectures et écritures métier, avec un `populate` qui ne charge que les champs affichés (un seul aller-retour, aucune relation inutile).
- **Validation** (`src/utils/validation.ts`) : schémas yup (fournis par `@strapi/utils`) appliqués quel que soit le client, avec messages en français et erreurs par champ (`400 ValidationError`). Les contraintes sont aussi déclarées dans les schémas des content types (défense en profondeur pour l'admin).
- **Sérialisation** (`src/utils/serializers.ts`) : l'API publique n'expose que les champs d'affichage de l'auteur (ni e-mail ni rôle technique). C'est aussi pourquoi le profil public passe par `/api/members/:username` et non par `/api/users`, qui reste fermé.
- **Permissions** (`src/bootstrap/permissions.ts`) : déclarées dans le code et synchronisées au démarrage, donc identiques sur chaque environnement. Pour les API de la communauté, la liste fait foi : une permission ajoutée à la main dans l'admin est retirée au redémarrage.

### Performance et cohérence

- **Compteur dénormalisé** `repliesCount` + `lastActivityAt` : les listes n'ont ni à charger ni à compter les réponses, et le tri « dernière activité » comme le filtre « sans réponse » se font en SQL. Un middleware du Document Service (`src/document-middlewares/reply-stats.ts`) recalcule ces valeurs à chaque création, modification ou suppression de réponse, **y compris depuis l'admin**.
- **Index** (`src/bootstrap/indexes.ts`) sur la date de création, la dernière activité, le compteur, les slugs et la date des réponses. Ils sont créés au bootstrap avec `CREATE INDEX IF NOT EXISTS` (compatible PostgreSQL et SQLite), parce qu'une migration Strapi s'exécuterait avant la création des tables au tout premier démarrage.
- **Date de publication** : sans Draft & Publish, Strapi réécrit le champ technique `publishedAt` à chaque modification faite dans l'admin. Trier dessus ferait remonter une ancienne discussion après une simple correction de coquille. L'API expose donc `createdAt` comme date de publication (un test le vérifie).
- **Slugs** générés côté serveur depuis le titre (sans accents), avec suffixe en cas de doublon (`-2`, `-3`…).

### Données de démonstration

`src/seed/` reprend les espaces, membres et discussions de la maquette. Le seed s'exécute au démarrage si la base ne contient aucune discussion (`SEED_DEMO_DATA=false` pour le désactiver). Il est réentrant : les catégories et comptes déjà présents sont réutilisés. `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` créent le premier compte administrateur.

---

## 6. Architecture frontend (Next.js)

### Rendu et récupération des données

Le projet utilise **Cache Components**, le modèle par défaut de Next.js 16 :

- **Le cadre de chaque page est prérendu** (en-tête, navigation, composer, espaces) puis servi immédiatement.
- **Les lectures publiques sont mises en cache côté serveur** (`'use cache'` + `cacheTag` + `cacheLife`) dans `src/lib/strapi/queries.ts`. Les arguments (filtres, page) font partie de la clé de cache, et les données sont étiquetées `categories` ou `discussions`.
- **Ce qui dépend de la requête arrive en streaming derrière `<Suspense>`** avec un squelette : le fil (il dépend de `?filtre`, `?tri`, `?page`) et tout ce qui lit le cookie de session (en-tête du compte, zone de réponse, carte « Rejoignez la communauté »). `next build` affiche toutes les pages en *Partial Prerender*.
- **Next.js n'accède jamais à la base** : toutes les données passent par l'API Strapi, via un client unique et typé (`src/lib/strapi/client.ts`, `server-only`). L'URL interne de Strapi et le jeton ne sont jamais envoyés au navigateur.

### Actualisation

| Événement | Mécanisme | Effet |
|---|---|---|
| Un membre publie une discussion ou une réponse | La Server Action appelle `updateTag('discussions')` | expiration immédiate : l'auteur voit sa contribution aussitôt (lecture de sa propre écriture) |
| Un éditeur modifie un contenu dans l'admin Strapi | un middleware du Document Service appelle `POST /api/revalidate` (secret partagé), qui appelle `revalidateTag` | la modification apparaît à la requête suivante |
| Aucun signal | `cacheLife('minutes')` pour les discussions, `('hours')` pour les espaces | durée de vie maximale du cache |
| Densité d'affichage, tri | cookie + `router.refresh()`, ou URL + `router.push` | rendu serveur avec la nouvelle préférence |

### Server et Client Components

Les composants sont **serveur par défaut** : pages, listes, cartes, détail, widgets. Seuls ceux qui ont besoin d'état ou d'événements navigateur sont **client** :

- formulaires (`NewDiscussionForm`, `ReplyForm`, `LoginForm`) : `useActionState`, validation immédiate, état d'envoi ;
- contrôles du fil (`SortSelect`, `DensityToggle`), menu du compte, liens actifs (`usePathname`), barre basse mobile ;
- `RelativeTime` : « il y a 3 h » dépend de l'heure de consultation. Le serveur rend une date absolue stable (compatible avec le cache), remplacée dans le navigateur sans écart d'hydratation.

### Authentification

Connexion via Users & Permissions (`/api/auth/local`) dans une Server Action. Le JWT est stocké dans un **cookie httpOnly** (`SameSite=Lax`, `Secure` en production), donc illisible par le JavaScript de la page. Les Server Actions le relaient à Strapi, qui reste seul juge des droits ; aucune règle métier n'est dupliquée côté Next.js. `src/proxy.ts` redirige vers la connexion, sans attendre le rendu, un visiteur sans cookie qui ouvre `/publier`.

### Validation et erreurs

- **Contrôles navigateur** (`src/lib/validation.ts`) : confort de saisie uniquement. Ils reprennent les règles de Strapi.
- **Erreurs Strapi** : les erreurs 400 par champ sont affichées sous le champ concerné ; 401, 403 et 404 donnent un message clair ; une indisponibilité de l'API donne un message dédié, sans détail technique.
- **États de chargement, d'erreur et d'absence de données** : `loading.tsx` et squelettes `<Suspense>`, `error.tsx` (bouton Réessayer), `global-error.tsx`, `not-found.tsx`, et des états vides contextualisés (aucune discussion, recherche sans résultat, page vide, « toutes les questions ont une réponse »).

### Intégration de la maquette

Les tokens de la charte (couleurs, ombres, rayons, mode sombre) sont repris de la maquette en variables CSS et exposés à Tailwind via `@theme`, ce qui donne des utilitaires comme `bg-surface` ou `text-ink-2`. La mise en page et la typographie sont en utilitaires Tailwind dans les composants. Quelques classes (`.btn-primary`, `.space-icon`, `.avatar`, `.hero`) regroupent les effets peu lisibles en utilitaires (dégradés, `color-mix`). Les points de rupture de la maquette sont conservés : 760 px (une colonne et barre basse), 860 px, 1100 px et 1180 px (trois colonnes).

Écrans réalisés : accueil (hero ou salutation, composer, onglets, tri, vue détaillée ou compacte, pagination), espaces, espace, discussion (réponse de la rédaction mise en avant, mentions `@`, suggestions « À lire aussi »), publication, connexion, recherche et profil membre.

### Bibliothèques ajoutées

| Bibliothèque | Pourquoi |
|---|---|
| `lucide-react` | la maquette utilise les pictogrammes Lucide : rendu identique, import à l'unité |
| `server-only` | garantit que le client Strapi et la session ne partent jamais dans le bundle navigateur |
| `concurrently` (racine) | lancer Strapi et Next.js avec une seule commande |
| Jest, ts-jest, supertest (backend) | tests d'API sur une vraie instance Strapi |
| Vitest, Testing Library (frontend) | tests unitaires et de composants |
| Playwright | tests de bout en bout (bonus) |

---

## 7. Tests

| Suite | Contenu |
|---|---|
| **Backend** `backend/tests/` (Jest + supertest, Strapi réel sur une base SQLite jetable) | validation d'une discussion (400 par champ, titre de moins de 10 caractères, contenu, type, catégorie), **refus d'une publication non authentifiée** (403) et d'un jeton invalide (401), **usurpation d'auteur** (id, documentId, `connect`) → 403 sans écriture, **affichage** (champs publics, tri, filtre, pagination, 404), réponses (compteur, activité, suppression depuis l'admin), permissions (`/api/users` fermé, pas de PUT ni DELETE), date de publication stable après une édition dans l'admin, tests unitaires (validation, policy, slug) |
| **Frontend** `frontend/src/**/*.test.ts(x)` (Vitest) | affichage d'une liste de discussions (titre, espace, auteur, réponses, date, état vide, vue compacte), mise en forme sûre des messages (pas d'injection HTML), paramètres d'URL, validation, mapping des erreurs Strapi, redirections sûres |
| **E2E** `frontend/e2e/` (Playwright) | accueil, filtre par espace, tri, recherche, 404, visiteur redirigé, identifiants invalides, création avec erreurs puis redirection, réponse, réponse vide, mobile (barre basse, pas de défilement horizontal) |

Les tests backend compilent le projet dans `.tmp/test-dist` et utilisent `.tmp/test.db` : ils ne touchent ni au `dist` ni à la base du serveur de développement. Les tests e2e créent des discussions de test horodatées dans la base locale (`npm run seed:reset` pour nettoyer).

## 8. Bonus réalisés

Recherche plein texte, pagination côté serveur, profil membre, tests Playwright, Docker Compose. Également : vue compacte, compteur « sans réponse », invalidation du cache déclenchée par Strapi, mode sombre.

## 9. Limites et évolutions possibles

- **Votes « Utile » et meilleure réponse** : un content type `Vote` (utilisateur et réponse, unique) et une action `PUT /discussions/:id/best-answer` protégée par une policy `is-discussion-author`.
- **Inscription** et mot de passe oublié : endpoints Users & Permissions natifs, à brancher avec un service d'e-mail. En production, connexion SSO lerevenu.com comme dans la maquette.
- **Recherche** : `$containsi` (ILIKE) suffit à ce volume ; au-delà, index plein texte PostgreSQL (`tsvector`) ou moteur dédié (Meilisearch).
- **Invalidation plus fine** : étiquettes par discussion (`discussion:<slug>`) plutôt qu'un tag global, et cache partagé (`'use cache: remote'`) avec plusieurs instances Next.js.
- **Modération** : signalements, statut masqué, rate limiting des écritures (le rate limit Users & Permissions ne couvre que l'authentification).
- **Docker** : la composition n'a pas pu être exécutée sur le poste de développement (Docker Desktop indisponible). Le mode PostgreSQL a été validé avec une instance PostgreSQL 16 locale.

## 10. Écart entre l'annonce et le sujet

L'annonce mentionne SQLite, le sujet PostgreSQL. Le projet cible PostgreSQL (configuration, Docker Compose, index compatibles) et reste lançable sans installation sur SQLite. La base SQLite de démonstration demandée dans l'annonce est fournie (`backend/database/communaute-demo.db`).

## 11. Outils

Des outils d'assistance au développement, dont l'IA, ont été utilisés comme le sujet l'autorise. Les choix décrits ici sont assumés et commentés dans le code.
