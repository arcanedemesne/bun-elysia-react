import postgres from "postgres";

const sql = postgres({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

type seedUser = {
  id: string;
  username: string;
};

type seedTeam = {
  id: string;
  name: string;
  createBy: string;
  createdOn: Date;
};

async function initializeDatabase() {
  try {
    if (!process.env.POSTGRES_DB || !process.env.POSTGRES_USER) {
      console.error(
        "POSTGRES_DB or POSTGRES_USER environment variables are not set.",
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
        await sql`DROP TABLE IF EXISTS users_teams CASCADE`;
        await sql`DROP TABLE IF EXISTS teams CASCADE`;
        await sql`DROP TABLE IF EXISTS users CASCADE`;
        await sql`DROP TABLE IF EXISTS todos CASCADE`;
        console.log("Tables dropped.");
      }

      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          "isOnline" BOOLEAN NOT NULL DEFAULT FALSE,
          "refreshToken" VARCHAR(255),
          "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create teams table
      await sql`
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) UNIQUE NOT NULL,
          "createdBy" UUID REFERENCES users (id) NOT NULL,
          "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Create users-teams bridge table
      await sql`
        CREATE TABLE IF NOT EXISTS users_teams (
          "userId" UUID REFERENCES users (id) NOT NULL,
          "teamId" UUID REFERENCES teams (id) NOT NULL,
          UNIQUE ("userId", "teamId")
        )
      `;

      // Create todos table
      await sql`
        CREATE TABLE IF NOT EXISTS todos (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          description VARCHAR(255),
          "teamId" UUID REFERENCES teams (id),
          "createdBy" UUID REFERENCES users (id) NOT NULL,
          "createdOn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const seedUserName = "jenny";
      const seedTeamName = "Seed Team #1";
      const hashedPassword = await Bun.password.hash("123456");

      // Insert a seed user
      const users: seedUser[] = await sql.unsafe<seedUser[]>(`
          INSERT INTO users (username, password) VALUES
          ('${seedUserName}', '${hashedPassword}')
          ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
          RETURNING id, username
      `);

      if (users.length > 0) {
        const jennyId = users.find(
          (user: seedUser) =>
            user.id !== undefined && user.username === seedUserName,
        )?.id;

        if (jennyId) {
          // insert a todo for the seed user
          await sql`
              INSERT INTO todos (title, description, "createdBy") VALUES
              ('This is an example todo item', 'This is an example description', ${jennyId})
            `;

          // Insert a seed team
          const teams: seedTeam[] = await sql.unsafe<seedTeam[]>(`
              INSERT INTO teams (name, "createdBy") VALUES
              ('${seedTeamName}', '${jennyId}')
              RETURNING id, name, "createdBy", "createdOn"
          `);
          console.log(teams);
          if (teams.length > 0) {
            const teamId = teams.find(
              (team: seedTeam) =>
                team.id !== undefined && team.name === seedTeamName,
            )?.id;

            if (teamId) {
              // insert a connection between seed user and seed team
              await sql.unsafe<seedTeam[]>(
                `INSERT INTO users_teams ("userId", "teamId") VALUES ('${jennyId}', '${teamId}')`,
              );

              // insert a todo for the seed team user
              await sql`
                INSERT INTO todos (title, description, "teamId", "createdBy") VALUES
                ('This is a team example todo item', 'This is a team example description', ${teamId}, ${jennyId})
              `;
            }
          }
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
