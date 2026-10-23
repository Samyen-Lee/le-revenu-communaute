import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      // Jeton JWT classique : le front Next.js le conserve dans un cookie httpOnly
      // et le transmet à Strapi depuis le serveur (Server Components / Server Actions).
      jwtManagement: 'legacy-support',
      jwt: { expiresIn: env('JWT_EXPIRES_IN', '7d') },
      // Les champs de profil (type de membre, expertise…) ne sont jamais modifiables à l'inscription.
      register: { allowedFields: [] },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: ['image/*'],
        deniedTypes: ['image/svg+xml'],
      },
    },
  },
});

export default config;
