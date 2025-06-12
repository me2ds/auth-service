FROM oven/bun AS builder

WORKDIR /app

COPY package*.json ./
COPY .env* ./
COPY tsconfig.json ./tsconfig.json

RUN bun install

COPY . .

RUN bun run build

FROM oven/bun AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env* ./

EXPOSE 8000

CMD ["node", "dist/main"]