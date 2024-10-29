
FROM node:23.1.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM base AS production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY prisma ./prisma
RUN pnpm run database:generate
RUN pnpm prune --prod --no-optional

FROM base
WORKDIR /app
COPY --from=production /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/prisma /app/prisma 
COPY package.json ./scripts/start.sh ./

ENV NODE_ENV="production"
CMD ["./start.sh"]
