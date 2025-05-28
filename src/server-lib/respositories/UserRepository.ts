import { and, eq, ilike, inArray } from "drizzle-orm";

import { IUser, IUserInsert, IUserUpdate } from "@/lib/models";

import { db } from "../../data/db";
import { users, usersToOrganizations, usersToTeams } from "../../data/schema";
import { IRepository } from "./IRepository";
import { paramaterize, throwDbError } from "./utilities";

const clauses = {
  isActive: eq(users.active, true),
};

export class UserRepository implements IRepository<IUser, IUserInsert, IUserUpdate> {
  async getAll(): Promise<IUser[]> {
    try {
      const query = db.query.users
        .findMany({
          where: clauses.isActive,
        })
        .prepare("getAll");

      return (await query.execute()) as IUser[];
    } catch (error) {
      return throwDbError("Error getting users", error);
    }
  }

  async search(organizationId: string, searchTerm: string): Promise<IUser[]> {
    try {
      const { placeholders, values } = paramaterize({ organizationId, searchTerm: `%${searchTerm}%` });
      const query = db.query.users
        .findMany({
          where: and(ilike(users.username, placeholders.searchTerm), clauses.isActive),
          with: {
            usersToOrganizations: {
              columns: { organizationId: true },
              where: eq(usersToOrganizations.organizationId, placeholders.organizationId),
            },
          },
        })
        .prepare("search");

      return (await query.execute(values)) as IUser[];
    } catch (error) {
      return throwDbError("Error searching users", error);
    }
  }

  async getByTeamIds(teamIds: string[]): Promise<string[]> {
    try {
      const query = db.query.usersToTeams
        .findMany({
          where: inArray(usersToTeams.teamId, teamIds),
        })
        .prepare("getByTeamIds");

      return (await query.execute()).map((x) => x.userId) as string[];
    } catch (error) {
      return throwDbError("Error getting user ids by list of team ids", error);
    }
  }

  async getByOrganizationIds(organizationIds: string[]): Promise<string[]> {
    try {
      const query = db.query.usersToOrganizations
        .findMany({
          where: inArray(usersToOrganizations.organizationId, organizationIds),
        })
        .prepare("getByOrganizationIds");

      return (await query.execute()).map((x) => x.userId) as string[];
    } catch (error) {
      return throwDbError("Error getting user ids by list of organization ids", error);
    }
  }

  async getById(id: string): Promise<IUser | null> {
    try {
      const { placeholders, values } = paramaterize({ id });
      const query = await db.query.users
        .findFirst({
          where: and(eq(users.id, placeholders.id), clauses.isActive),
        })
        .prepare("getById");

      return (await query.execute(values)) as IUser;
    } catch (error) {
      return throwDbError("Error getting user by id", error);
    }
  }

  async getByUsername(username: string): Promise<IUser | null> {
    try {
      const { placeholders, values } = paramaterize({ username });
      const query = db.query.users
        .findFirst({
          where: and(eq(users.username, placeholders.username), clauses.isActive),
        })
        .prepare("getByUsername");

      return (await query.execute(values)) as IUser;
    } catch (error) {
      return throwDbError("Error getting user by username", error);
    }
  }

  async getByEmail(email: string): Promise<IUser | null> {
    try {
      const { placeholders, values } = paramaterize({ email });
      const query = db.query.users
        .findFirst({
          where: and(eq(users.email, placeholders.email), clauses.isActive),
        })
        .prepare("getByEmail");

      return (await query.execute(values)) as IUser;
    } catch (error) {
      return throwDbError("Error getting user by email", error);
    }
  }

  async insert(payload: IUserInsert): Promise<IUser | null> {
    try {
      const { placeholders, values } = paramaterize(payload);
      const query = db
        .insert(users)
        .values(placeholders as typeof users.$inferInsert)
        .returning()
        .prepare("insert");

      const data = (await query.execute(values)) as IUser[];

      if (data.length === 0) {
        throw new Error();
      }
      return data[0] as IUser;
    } catch (error) {
      return throwDbError("Error inserting user", error);
    }
  }

  async update(payload: IUserUpdate): Promise<IUser | null> {
    const { placeholders, values } = paramaterize(payload, true);
    try {
      const query = db
        .update(users)
        .set(placeholders)
        .where(eq(users.id, placeholders.id))
        .returning()
        .prepare("update");

      return (await query.execute(values))[0] as IUser;
    } catch (error) {
      return throwDbError("Error updating user", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await this.getById(id);

      if (existingEntity) {
        const entity = await this.update({ id: existingEntity.id, active: false });
        if (!entity?.active) {
          return true; // soft deleted successfully
        }
      } else {
        const { placeholders, values } = paramaterize({ id });
        const query = db.delete(users).where(eq(users.id, placeholders.id)).returning().prepare("delete");

        const entity = (await query.execute(values))[0] as IUser;
        if (!entity) {
          return true; // hard deleted successfully
        }
      }

      throw new Error();
    } catch (error) {
      return throwDbError("Error deleting user", error);
    }
  }
}
