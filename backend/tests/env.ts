/** Environnement des tests : base SQLite jetable, données de démo, aucun appel sortant. */
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_CLIENT: 'sqlite',
  // Résolu par config/database.ts depuis .tmp/test-dist/config/../.. soit .tmp/ : fichier final .tmp/test.db
  DATABASE_FILENAME: 'test.db',
  APP_KEYS: 'testKeyA,testKeyB',
  API_TOKEN_SALT: 'test-api-token-salt',
  ADMIN_JWT_SECRET: 'test-admin-jwt-secret',
  TRANSFER_TOKEN_SALT: 'test-transfer-token-salt',
  JWT_SECRET: 'test-jwt-secret',
  ENCRYPTION_KEY: 'test-encryption-key',
  SEED_DEMO_DATA: 'true',
  SEED_RESET: 'false',
  SEED_ADMIN_EMAIL: '',
  SEED_ADMIN_PASSWORD: '',
  FRONTEND_REVALIDATE_URL: '',
});
