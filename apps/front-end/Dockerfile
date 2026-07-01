# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

WORKDIR /repo

FROM base AS deps

RUN pnpm config set store-dir /pnpm/store

# Every workspace manifest so `pnpm install --frozen-lockfile` resolves the full graph
# and this layer caches until a package.json changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/front-end/package.json apps/front-end/
COPY apps/medusa/package.json apps/medusa/
COPY packages/biome-config/package.json packages/biome-config/
COPY packages/env/package.json packages/env/
COPY packages/revalidation/package.json packages/revalidation/
COPY packages/site-config/package.json packages/site-config/
COPY packages/typescript-config/package.json packages/typescript-config/

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY apps/front-end apps/front-end
COPY packages/site-config packages/site-config
COPY packages/typescript-config packages/typescript-config

# NEXT_PUBLIC_* values are inlined by Next.js at build time.
# Empty defaults let local images build unattended; pass real values via --build-arg in production.
ARG MEDUSA_BACKEND_URL="http://backend:9000"
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=""
ARG NEXT_PUBLIC_DEFAULT_REGION_ID=""
ARG NEXT_PUBLIC_DEFAULT_SALES_CHANNEL_ID=""
ARG NEXT_PUBLIC_MEILISEARCH_HOST=""
ARG NEXT_PUBLIC_POSTHOG_HOST=""
ARG NEXT_PUBLIC_POSTHOG_KEY=""
ARG NEXT_PUBLIC_SENTRY_DSN=""
ARG NEXT_PUBLIC_STRIPE_KEY=""
ARG NEXT_PUBLIC_CONSENT_FOUNDATION_ENABLED=""
ARG SENTRY_AUTH_TOKEN=""

ENV MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_DEFAULT_REGION_ID=$NEXT_PUBLIC_DEFAULT_REGION_ID \
    NEXT_PUBLIC_DEFAULT_SALES_CHANNEL_ID=$NEXT_PUBLIC_DEFAULT_SALES_CHANNEL_ID \
    NEXT_PUBLIC_MEILISEARCH_HOST=$NEXT_PUBLIC_MEILISEARCH_HOST \
    NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY \
    NEXT_PUBLIC_CONSENT_FOUNDATION_ENABLED=$NEXT_PUBLIC_CONSENT_FOUNDATION_ENABLED \
    SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN pnpm --filter @repo/storefront build

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build --chown=nonroot:nonroot /repo/apps/front-end/.next/standalone /app
COPY --from=build --chown=nonroot:nonroot /repo/apps/front-end/.next/static /app/apps/front-end/.next/static
COPY --from=build --chown=nonroot:nonroot /repo/apps/front-end/public /app/apps/front-end/public

EXPOSE 3000

CMD ["apps/front-end/server.js"]
