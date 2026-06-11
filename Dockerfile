FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches/
COPY drizzle ./drizzle/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS="--experimental-transform-types"

CMD ["node", "dist/index.js"]
