import { eq, ilike } from "drizzle-orm";

import { User, UserDTO, UserInsertDTO, UserUpdateDTO } from "@/lib/models";

import { db } from "../data/db";
import { users } from "../data/schema";
import { IRepository } from "./IRepository";
import { throwDbError } from "./utilities";

export class UserRepository
  implements IRepository<User, UserDTO, UserInsertDTO, UserUpdateDTO>
{
  async getAll(): Promise<User[]> {
    try {
      const data = await db.select().from(users).orderBy(users.username);
      return data as User[];
    } catch (error) {
      return throwDbError("Error getting users", error);
    }
  }

  async search(searchTerm: string): Promise<UserDTO[]> {
    try {
      const data = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(ilike(users.username, `%${searchTerm}%`))
        .orderBy(users.username);
      return data as UserDTO[];
    } catch (error) {
      return throwDbError("Error searching users", error);
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      const data = await db.select().from(users).where(eq(users.id, id));
      if (data.length === 0) {
        return null;
      }
      return data[0] as User;
    } catch (error) {
      return throwDbError("Error getting user by id", error);
    }
  }

  async getByUsername(username: string): Promise<User | null> {
    try {
      const data = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .orderBy(users.username);
      if (data.length === 0) {
        return null;
      }
      return data[0] as User;
    } catch (error) {
      return throwDbError("Error getting user by username", error);
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const data = await db.select().from(users).where(eq(users.email, email));
      if (data.length === 0) {
        return null;
      }
      return data[0] as User;
    } catch (error) {
      return throwDbError("Error getting user by email", error);
    }
  }

  async insert(insertData: UserInsertDTO): Promise<User | null> {
    try {
      const data = await db.insert(users).values(insertData).returning();
      if (data.length === 0) {
        return null; // Insertion failed
      }
      return data[0] as User;
    } catch (error) {
      return throwDbError("Error inserting user", error);
    }
  }

  async update(updateData: UserUpdateDTO): Promise<User | null> {
    try {
      const { id, ...rest } = updateData;
      const data = await db
        .update(users)
        .set(rest)
        .where(eq(users.id, id))
        .returning();

      if (data.length === 0) {
        return null; // User not found
      }
      return data[0] as User;
    } catch (error) {
      return throwDbError("Error updating user", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
      let data;
      if (existingEntity.length > 0) {
        data = await this.update({ id: existingEntity[0].id, active: false });
        if (data?.id) {
          return true; // soft deleted successfully
        }
      } else {
        data = await db.delete(users).where(eq(users.id, id)).returning();
        if (data) {
          return true; // hard deleted successfully
        }
      }

      return false; // unsuccessful delete
    } catch (error) {
      return throwDbError("Error deleting user", error);
    }
  }
}
