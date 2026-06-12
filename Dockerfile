FROM node:22-slim AS build
WORKDIR /src
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Caddy serves the static bundle and proxies /api to the Go container. In the
# homelab stack the existing Caddy can serve dist/ directly instead — this
# image just makes the compose file self-contained.
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /src/dist /srv
