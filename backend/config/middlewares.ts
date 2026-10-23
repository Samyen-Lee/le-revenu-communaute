import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    // L'API est appelée par le serveur Next.js ; le CORS ne s'ouvre qu'à l'origine du front.
    name: 'strapi::cors',
    config: { origin: env.array('CORS_ORIGINS', ['http://localhost:3000']) },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
