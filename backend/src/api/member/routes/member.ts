/**
 * Profil public d'un membre. Route dédiée plutôt que /api/users : l'endpoint natif de
 * Users & Permissions exposerait la liste des comptes et leurs e-mails.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/members/:username',
      handler: 'api::member.member.findOne',
    },
  ],
};
