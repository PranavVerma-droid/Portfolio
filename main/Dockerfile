# pranavv v3: Astro server rendered on request from PocketBase.
# Copyright (C) 2026 Pranav Verma. Licensed under GNU AGPL v3.

ARG NODE_IMAGE=node:24.20.0-alpine

# ---- build: install everything, type-check and build ----
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run check && npm run build

# ---- deps: production dependencies only (astro, the node adapter, sharp, sanitize-html) ----
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---- runtime ----
FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    PB_URL=https://pb-1.pranavv.co.in
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/robots.txt" > /dev/null || exit 1
CMD ["node", "dist/server/entry.mjs"]
