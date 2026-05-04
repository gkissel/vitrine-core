FROM node:20-slim AS base
RUN corepack enable

# ---- Install dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json .npmrc ./
RUN pnpm install --no-frozen-lockfile

# ---- Build Medusa ----
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ---- Production ----
FROM base AS runner
WORKDIR /app

COPY --from=build /app/.medusa/server/ ./
COPY package.json ./

RUN pnpm install --prod --frozen-lockfile=false

EXPOSE 9000

CMD ["sh", "-c", "pnpm exec medusa db:migrate && pnpm run start"]
