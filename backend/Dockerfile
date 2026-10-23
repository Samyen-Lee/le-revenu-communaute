# API Strapi v5 (production). Base Debian pour profiter des binaires précompilés (better-sqlite3).
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
# Compile le TypeScript et l'interface d'administration
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 1337
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=10 \
  CMD node -e "fetch('http://localhost:1337/_health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["npm", "run", "start"]
