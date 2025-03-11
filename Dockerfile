FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY src/ ./src/
COPY public/ ./public/

EXPOSE 3000

CMD ["bun", "run", "src/index.tsx"]