import postgres from "postgres";

const sql = postgres({
  host: process.env.POSTGRES_HOST || "localhost", // Use environment variable or default
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

export default sql;
