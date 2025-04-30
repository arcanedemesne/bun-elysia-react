import sql from "../db";
import { z } from "zod";

import {
  User,
  UserUpdate,
  UserInsert,
  IRepository,
} from "../types";

const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  password: z.string(),
  isOnline: z.boolean(),
  refreshToken: z.string().nullable(),
});

const usersSchema = z.array(userSchema);

const userInsertSchema = z.object({
  username: z.string(),
  password: z.string(),
  isOnline: z.boolean(),
  refreshToken: z.string().nullable(),
});

const userUpdateSchema = z.object({
  id: z.string().uuid(),
  username: z.string().optional(),
  password: z.string().optional(),
  isOnline: z.boolean().optional(),
  refreshToken: z.string().nullable().optional(),
});

export class UserRepository
  implements IRepository<User, UserInsert, UserUpdate>
{
  async getAll(): Promise<User[]> {
    try {
      const data = await sql`
          SELECT id, username, password, "isOnline", "refreshToken"          
          FROM users`;

      const validatedData = usersSchema.parse(data);
      return validatedData as User[];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async search(search: string): Promise<User[]> {
    try {
      const data = await sql`
          SELECT id, username, password, "isOnline", "refreshToken"          
          FROM users
          WHERE username ILIKE '%${search}%'`;

      const validatedData = usersSchema.parse(data);
      return validatedData as User[];
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      const data = await sql`
          SELECT id, username, password, "isOnline", "refreshToken"
          FROM users WHERE id = ${id}`;

      if (data.length === 0) {
        return null;
      }

      const validatedData = userSchema.parse(data[0]);
      return validatedData as User;
    } catch (error) {
      console.error("Error getting user by id:", error);
      return null;
    }
  }

  async getByUsername(username: string): Promise<User | null> {
    try {
      const data = await sql`
          SELECT id, username, password, "isOnline", "refreshToken"
          FROM users WHERE username = ${username}`;

      if (data.length === 0) {
        return null;
      }

      const validatedData = userSchema.parse(data[0]);
      return validatedData as User;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return null;
    }
  }

  async insert(userData: UserInsert): Promise<User | null> {
    try {
      const validatedInsertData = userInsertSchema.parse(userData);

      const data = await sql`
          INSERT INTO users (username, password, "isOnline", "refreshToken")
          VALUES (${validatedInsertData.username}, ${validatedInsertData.password}, ${validatedInsertData.isOnline}, ${validatedInsertData.refreshToken})
          RETURNING id, username, password, "isOnline", "refreshToken"
        `;

      if (data.length === 0) {
        return null; // Insertion failed
      }

      const insertedData = userSchema.parse(data[0]);
      return insertedData as User;
    } catch (error) {
      console.error("Error inserting user:", error);
      return null;
    }
  }

  async update(updateData: UserUpdate): Promise<User | null> {
    try {
      const validatedUpdateData = userUpdateSchema.parse(updateData);

      // Build the SET clause dynamically
      const setClauses: string[] = [];
      const values: any[] = [];
      let valueIndex = 1; // Start at 1 for parameterized queries

      if (validatedUpdateData.username !== undefined) {
        setClauses.push(`username = $${valueIndex++}`);
        values.push(validatedUpdateData.username);
      }
      if (validatedUpdateData.password !== undefined) {
        setClauses.push(`password = $${valueIndex++}`);
        values.push(validatedUpdateData.password);
      }
      if (validatedUpdateData.isOnline !== undefined) {
        setClauses.push(`"isOnline" = $${valueIndex++}`);
        values.push(validatedUpdateData.isOnline);
      }
      if (validatedUpdateData.refreshToken !== undefined) {
        setClauses.push(`"refreshToken" = $${valueIndex++}`);
        values.push(validatedUpdateData.refreshToken);
      }

      if (setClauses.length === 0) {
        return null;
      }

      // Build the SQL query
      const setClauseString = setClauses.join(", ");
      const query = `
          UPDATE users SET ${setClauseString} WHERE id = $${valueIndex}
          RETURNING id, username, password, "isOnline", "refreshToken"`;
      values.push(validatedUpdateData.id); // Add the ID to the values array

      const data = await sql.unsafe(query, values);

      if (data.length === 0) {
        return null; // User not found
      }

      const updatedData = userSchema.parse(data[0]);
      return updatedData as User;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      let result = await sql`DELETE FROM users_teams WHERE "userId" = ${id}`;

      result = await sql`DELETE FROM users WHERE id = ${id}`;
      if (result.count > 0) {
        return true; // User deleted successfully
      }
      return false; // User not found
    } catch (error) {
      console.error("Error deleting team:", error);
      return false;
    }
  }
}
