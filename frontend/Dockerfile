# Front Next.js (production).
FROM node:22-bookworm-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3000
# Avec Cache Components, `next build` prérend le cadre des pages à partir des données Strapi
# (espaces, listes en cache) : le build s'exécute donc au démarrage, une fois l'API disponible.
CMD ["sh", "-c", "npm run build && npm run start"]
