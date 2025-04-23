import sql from "../db";
import { z } from "zod";

import { User, UserUpdate, UserInsert } from "../types";

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
  username: z.string().optional(),
  password: z.string().optional(),
  isOnline: z.boolean().optional(),
  refreshToken: z.string().nullable().optional(),
});

export const userRepository = () => {
  return {
    async getUsers(): Promise<User[]> {
      try {
        const users = await sql`
          SELECT id, username, password, "isOnline", "refreshToken"          
          FROM users`;

        const validatedUsers = usersSchema.parse(users);
        return validatedUsers as User[];
      } catch (error) {
        console.error("Error getting users:", error);
        return [];
      }
    },
    async getUserById(id: string): Promise<User | null> {
      try {
        const users = await sql`
          SELECT id, username, password, "isOnline", "refreshToken"
          FROM users WHERE id = ${id}`;

        if (users.length === 0) {
          return null;
        }

        const validatedUser = userSchema.parse(users[0]);
        return validatedUser as User;
      } catch (error) {
        console.error("Error getting user by id:", error);
        return null;
      }
    },
    async getUserByUsername(username: string): Promise<User | null> {
      try {
        const users = await sql`
          SELECT id, username, password, "isOnline", "refreshToken"
          FROM users WHERE username = ${username}`;

        if (users.length === 0) {
          return null;
        }

        const validatedUser = userSchema.parse(users[0]);
        return validatedUser as User;
      } catch (error) {
        console.error("Error getting user by username:", error);
        return null;
      }
    },
    async insertUser(userData: UserInsert): Promise<User | null> {
      try {
        const validatedUserData = userInsertSchema.parse(userData);

        const insertedUsers = await sql`
          INSERT INTO users (username, password, "isOnline", "refreshToken")
          VALUES (${validatedUserData.username}, ${validatedUserData.password}, ${validatedUserData.isOnline}, ${validatedUserData.refreshToken})
          RETURNING id, username, password, "isOnline", "refreshToken"
        `;

        if (insertedUsers.length === 0) {
          return null; // Insertion failed
        }

        return insertedUsers[0] as User; // Return the inserted user
      } catch (error) {
        console.error("Error inserting user:", error);
        return null;
      }
    },
    async updateUser(id: string, updateData: UserUpdate): Promise<User | null> {
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
        values.push(id); // Add the ID to the values array

        const updatedUsers = await sql.unsafe(query, values);

        if (updatedUsers.length === 0) {
          return null; // User not found
        }

        const validatedUser = userSchema.parse(updatedUsers[0]);
        return validatedUser as User; // Return the updated user
      } catch (error) {
        console.error("Error updating user:", error);
        return null;
      }
    },
    async deleteUser(id: string): Promise<boolean> {
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
    },
  };
};
