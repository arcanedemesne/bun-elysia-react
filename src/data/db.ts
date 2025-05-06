import postgres from "postgres";

import { drizzle } from "drizzle-orm/postgres-js";

export const dbCredentials = {
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
};

const queryClient = postgres(dbCredentials);

export const db = drizzle({ client: queryClient, casing: "snake_case" });
