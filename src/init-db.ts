// src/init-db.ts
import postgres from "postgres";
import { User } from "./types/User/User";

const sql = postgres({
  host: process.env.POSTGRES_HOST || "localhost",
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

type seedUser = {
  id: string;
  username: string;
};

async function initializeDatabase() {
  try {
    if (!process.env.POSTGRES_DB || !process.env.POSTGRES_USER) {
      console.error(
        "POSTGRES_DB or POSTGRES_USER environment variables are not set."
      );
      process.exit(1);
    }

    // Begin transaction
    await sql.begin(async (sql) => {
      // Grant permissions (this is to create the extension to use UUID as Primary Key)
      const grantQuery = `GRANT CREATE ON DATABASE "${process.env.POSTGRES_DB}" TO "${process.env.POSTGRES_USER}"`;
      await sql.unsafe(grantQuery);

      // Create extension for use of UUID as Primary Key
      await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

      // Drop tables in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("Dropping existing tables in development mode...");
        await sql`DROP TABLE IF EXISTS todos`;
        await sql`DROP TABLE IF EXISTS users`;
        console.log("Tables dropped.");
      }

      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          "isOnline" BOOLEAN NOT NULL DEFAULT FALSE,
          "refreshToken" VARCHAR(255)
        )
      `;

      // Create todos table
      await sql`
        CREATE TABLE IF NOT EXISTS todos (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          "userId" UUID REFERENCES users (id),
          message VARCHAR(255) NOT NULL
        )
      `;

      const seedUserName = "jenny";
      const hashedPassword = await Bun.password.hash("123456");

      // Insert a test user
      const users: seedUser[] = await sql.unsafe<seedUser[]>(`
          INSERT INTO users (username, password) VALUES
          ('${seedUserName}', '${hashedPassword}')
          ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
          RETURNING id, username
      `);

      if (users.length > 0) {
        const jennyId = users.find(
          (user: seedUser) => user.id !== undefined && user.username === seedUserName
        )?.id;

        if (jennyId) {
          // insert a todo for the test user
          await sql`
            INSERT INTO todos ("userId", message) VALUES
            (${jennyId.toString()}, 'This is an example todo item');
          `;
        }
      }
    });

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

initializeDatabase();