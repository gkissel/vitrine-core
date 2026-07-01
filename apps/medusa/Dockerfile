# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22.14.0-bookworm-slim
ARG PNPM_VERSION=10.28.2
ARG TURBO_VERSION=2.9.8

FROM node:${NODE_VERSION} AS base
ENV CI=true \
    MEDUSA_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    TURBO_TELEMETRY_DISABLED=1
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

FROM base AS pruner
WORKDIR /repo
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm dlx turbo@${TURBO_VERSION} prune @repo/backend --docker

FROM base AS builder
WORKDIR /repo

COPY --from=pruner /repo/out/json/ ./
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /repo/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

COPY --from=pruner /repo/out/full/ ./

ARG MEDUSA_BACKEND_URL
ENV MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL}
RUN pnpm --filter @repo/backend run build

FROM base AS prod-deps
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=pruner /repo/out/json/ ./
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /repo/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /repo/apps/medusa/.npmrc ./.npmrc
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile --filter @repo/backend --ignore-scripts --prefer-offline

FROM node:${NODE_VERSION} AS runner
WORKDIR /app/apps/medusa
ENV NODE_ENV=production \
    PORT=9000

COPY --from=prod-deps --chown=node:node /repo/node_modules /app/node_modules
COPY --from=prod-deps --chown=node:node /repo/apps/medusa/node_modules ./node_modules
COPY --from=builder --chown=node:node /repo/apps/medusa/.medusa/server ./

USER node
EXPOSE 9000

# Apply pending database migrations before starting the API.
CMD ["sh", "-c", "./node_modules/.bin/medusa db:migrate && ./node_modules/.bin/medusa start"]
