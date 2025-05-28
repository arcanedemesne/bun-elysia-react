/* eslint-disable no-console */
import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";

import * as schema from "./schema";

export const dbCredentials = {
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
};

const queryClient = postgres(dbCredentials);

export const db = drizzle(queryClient, { casing: "snake_case", schema });

process.on("SIGTERM", async () => {
  console.log("Shutting down: closing postgres client pool");
  await queryClient.end();
  process.exit(0);
});
process.on("SIGINT", async () => {
  console.log("Shutting down: closing postgres client pool");
  await queryClient.end();
  process.exit(0);
});
