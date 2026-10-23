/** Les catégories sont en lecture seule côté API : elles se gèrent dans l'admin Strapi. */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::category.category', {
  only: ['find', 'findOne'],
});
