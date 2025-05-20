FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock tsconfig.json drizzle.config.ts ./

RUN bun install

COPY src/ ./src/
COPY public/ ./public/

EXPOSE 3000
EXPOSE 8080