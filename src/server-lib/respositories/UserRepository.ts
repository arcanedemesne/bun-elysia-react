import { and, eq, ilike, inArray } from "drizzle-orm";

import { IUser, IUserInsert, IUserUpdate } from "@/lib/models";

import { db } from "../../data/db";
import { users, usersToOrganizations, usersToTeams } from "../../data/schema";
import { IRepository } from "./IRepository";
import { removePropsFromEntities, throwDbError } from "./utilities";

const clauses = {
  active: eq(users.active, true),
};

export class UserRepository implements IRepository<IUser, IUserInsert, IUserUpdate> {
  // #region CRUD
  async getAll(): Promise<IUser[]> {
    try {
      return (await db.query.users.findMany({ where: clauses.active })) as IUser[];
    } catch (error) {
      return throwDbError("Error getting users", error);
    }
  }

  async getById(id: string): Promise<IUser | null> {
    try {
      return (await db.query.users.findFirst({ where: and(eq(users.id, id), clauses.active) })) as IUser | null;
    } catch (error) {
      return throwDbError("Error getting user by id", error);
    }
  }

  async insert(payload: IUserInsert): Promise<IUser | null> {
    try {
      const entities = await db.insert(users).values(payload).returning();

      if (entities.length === 0) {
        throw new Error(`Could not insert user with username ${payload.username}`);
      }

      return entities[0] as IUser;
    } catch (error) {
      return throwDbError("Error inserting user", error);
    }
  }

  async update(payload: IUserUpdate): Promise<IUser | null> {
    try {
      const entities = await db.update(users).set(payload).where(eq(users.id, payload.id)).returning();

      if (entities.length === 0) {
        throw new Error(`Could not update user with id ${payload.id}`);
      }

      return entities[0] as IUser;
    } catch (error) {
      return throwDbError("Error updating user", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await this.getById(id);

      if (existingEntity) {
        const entity = await this.update({ id, deletedAt: new Date(), active: false });
        if (!entity?.active) {
          return true; // soft deleted successfully
        }
      } else {
        const entities = await db.delete(users).where(eq(users.id, id)).returning();

        if (entities.length > 0) {
          return true; // hard deleted successfully
        }
      }

      throw new Error();
    } catch (error) {
      return throwDbError("Error deleting user", error);
    }
  }
  // #endregion

  async search(organizationId: string, searchTerm: string): Promise<IUser[]> {
    try {
      const results = await db.query.users.findMany({
        with: {
          usersToOrganizations: {
            columns: { organizationId: true },
            where: eq(usersToOrganizations.organizationId, organizationId),
          },
        },
        where: and(ilike(users.username, searchTerm), clauses.active),
      });

      return removePropsFromEntities<IUser>(results, ["usersToOrganizations"]);
    } catch (error) {
      return throwDbError("Error searching users", error);
    }
  }

  async getByProperty(property: string, value: string): Promise<IUser | null> {
    try {
      return (await db.query.users.findFirst({
        where: and(eq(users[property], value), clauses.active),
      })) as IUser | null;
    } catch (error) {
      return throwDbError(`Error getting user by ${property} with value ${value}`, error);
    }
  }

  async getByTeamIds(teamIds: string[]): Promise<string[]> {
    try {
      const entities = await db.query.usersToTeams.findMany({
        where: inArray(usersToTeams.teamId, teamIds),
      });

      return entities.map((x) => x.userId) as string[];
    } catch (error) {
      return throwDbError("Error getting user ids by list of team ids", error);
    }
  }

  async getByOrganizationIds(organizationIds: string[]): Promise<string[]> {
    try {
      const entities = await db.query.usersToOrganizations.findMany({
        where: inArray(usersToOrganizations.organizationId, organizationIds),
      });

      return entities.map((x) => x.userId) as string[];
    } catch (error) {
      return throwDbError("Error getting user ids by list of organization ids", error);
    }
  }
}
