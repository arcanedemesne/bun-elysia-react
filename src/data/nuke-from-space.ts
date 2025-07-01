/* eslint-disable no-undef */
/* eslint-disable no-console */
import * as path from "path";
import { Client } from "pg";

import { dbCredentials } from "./db";
import { schemaName } from "./schema/config";
import * as fs from "fs/promises";

const client = new Client(dbCredentials);

const nukeFromSpace = async () => {
  await client.connect();

  try {
    const migrationsDirectory = path.join(__dirname, "drizzle", "migrations");
    await fs.rm(migrationsDirectory, { recursive: true, force: true });
    console.log(`Successfully deleted migrations folder: ${migrationsDirectory}`);

    console.log(`Dropping existing tables from schema "${schemaName}"...`);
    await client.query(`DROP TABLE IF EXISTS "${schemaName}".messages CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "${schemaName}".users_to_messages CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "${schemaName}".todos CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "${schemaName}".organizations CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "${schemaName}".users_to_organizations CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "${schemaName}".teams CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "${schemaName}".users_to_teams CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "${schemaName}".users CASCADE`);
    console.log(`Tables dropped from schema "${schemaName}".`);

    console.log(`Dropping schema "${schemaName}"...`);
    await client.query(`DROP SCHEMA IF EXISTS "${schemaName}"`);
    console.log(`Schema "${schemaName}" dropped.`);

    console.log(`Dropping existing tables from schema "drizzle"...`);
    await client.query(`DROP TABLE IF EXISTS "drizzle".__drizzle_migrations`);
    console.log(`Tables dropped from schema "drizzle".`);

    console.log(`Dropping schema "drizzle"...`);
    await client.query(`DROP SCHEMA IF EXISTS "drizzle"`);
    console.log(`Schema "drizzle" dropped.`);
  } catch (error) {
    console.error("Error creating schema:", error);
    process.exit(1);
  } finally {
    process.exit();
  }
};

nukeFromSpace();
