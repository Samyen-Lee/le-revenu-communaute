const MAX_SLUG_LENGTH = 80;

/** « Assurance-vie après 70 ans : est-ce encore intéressant ? » → « assurance-vie-apres-70-ans-est-ce-encore-interessant » */
export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '') || 'discussion';
