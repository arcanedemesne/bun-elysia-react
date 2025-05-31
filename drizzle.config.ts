import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/data/schema/index.ts",
  out: "./src/data/drizzle/migrations",
  dialect: "postgresql",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  casing: "snake_case",
});
