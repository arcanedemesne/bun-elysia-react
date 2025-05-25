import { and, eq, ilike, inArray } from "drizzle-orm";

import { User, UserDTO, UserInsertDTO, UserUpdateDTO } from "@/lib/models";

import { db } from "../../data/db";
import { users, usersToOrganizations, usersToTeams } from "../../data/schema";
import { IRepository } from "./IRepository";
import { throwDbError } from "./utilities";

export class UserRepository implements IRepository<User, UserDTO, UserInsertDTO, UserUpdateDTO> {
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
        .where(and(ilike(users.username, `%${searchTerm}%`), eq(users.active, true)))
        .orderBy(users.username);
      return data as UserDTO[];
    } catch (error) {
      return throwDbError("Error searching users", error);
    }
  }

  async getByTeamIds(teamIds: string[]): Promise<UserDTO[]> {
    try {
      const data = await db
        .select({
          id: users.id,
          username: users.username,
          sessionId: users.sessionId,
        })
        .from(users)
        .innerJoin(usersToTeams, eq(users.id, usersToTeams.userId))
        .where(and(inArray(usersToTeams.teamId, teamIds), eq(users.active, true)));
      if (data.length === 0) {
        return [];
      }
      return data as UserDTO[];
    } catch (error) {
      return throwDbError("Error getting users by list of team ids", error);
    }
  }

  async getByOrganizationIds(organizationIds: string[]): Promise<UserDTO[]> {
    try {
      const data = await db
        .select({
          id: users.id,
          username: users.username,
          sessionId: users.sessionId,
        })
        .from(users)
        .innerJoin(usersToOrganizations, eq(users.id, usersToOrganizations.userId))
        .where(and(inArray(usersToOrganizations.organizationId, organizationIds), eq(users.active, true)));
      if (data.length === 0) {
        return [];
      }
      return data as UserDTO[];
    } catch (error) {
      return throwDbError("Error getting users by list of organization ids", error);
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      const data = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), eq(users.active, true)));
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
        .where(and(eq(users.username, username), eq(users.active, true)))
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
      const data = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), eq(users.active, true)));
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
      const data = await db.update(users).set(rest).where(eq(users.id, id)).returning();

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
        .where(and(eq(users.id, id), eq(users.active, true)));
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
