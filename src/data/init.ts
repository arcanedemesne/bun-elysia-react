/* eslint-disable no-console */
import { Client } from "pg";

import { dbCredentials } from "./db";
import { schemaName } from "./schema";

const client = new Client(dbCredentials);

const initializeDatabase = async () => {
  await client.connect();

  try {
    // Execute the CREATE SCHEMA command directly, without parameters
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log("Schema created (or already existed)");
  } catch (error) {
    console.error("Error creating schema:", error);
    process.exit(1);
  } finally {
    process.exit();
  }
};

initializeDatabase();
