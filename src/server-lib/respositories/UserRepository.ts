import { and, eq, exists, ilike, inArray } from "drizzle-orm";

import { IUser, IUserInsert, IUserUpdate } from "@/lib/models";

import { db } from "../../data/db";
import { users, usersToOrganizations, usersToTeams } from "../../data/schema";
import { BaseRepository } from "./BaseRepository";
import { throwDbError, withRelations } from "./utilities";

const defaultWith = { ...withRelations.userAudits };

export class UserRepository extends BaseRepository<IUser, IUserInsert, IUserUpdate> {
  constructor(public userId?: string) {
    super(users, "User", userId, defaultWith);
  }

  async search({ searchQuery, organizationId }: { searchQuery: string; organizationId?: string }): Promise<IUser[]> {
    try {
      let whereClauses = [ilike(users.username, `%${searchQuery}%`), this.clauses.active];

      if (organizationId) {
        whereClauses.push(
          exists(db.select().from(usersToOrganizations).where(eq(usersToOrganizations.organizationId, organizationId))),
        );
      }
      const results = await db.query.users.findMany({
        with: defaultWith,
        where: and(...whereClauses),
      });

      return results as IUser[];
    } catch (error) {
      return throwDbError("Error searching users", error);
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
