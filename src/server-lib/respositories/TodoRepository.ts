import { and, eq, isNull } from "drizzle-orm";

import { ITodo, ITodoInsert, ITodoUpdate } from "@/lib/models";

import { db } from "../../data/db";
import { organizations, teams, todos } from "../../data/schema";
import { BaseRepository } from "./BaseRepository";
import { throwDbError, withRelations } from "./utilities";

const defaultWith = {
  ...withRelations.userAudits,
  organization: {
    where: eq(organizations.active, true),
  },
  team: {
    where: eq(teams.active, true),
  },
};

export class TodoRepository extends BaseRepository<ITodo, ITodoInsert, ITodoUpdate> {
  constructor(public userId: string) {
    super(todos, "Todo", userId, defaultWith);
  }

  async getByUserId(userId: string): Promise<ITodo[]> {
    try {
      return (await db.query.todos.findMany({
        with: defaultWith,
        where: and(
          eq(todos.createdById, userId),
          isNull(todos.organizationId),
          isNull(todos.teamId),
          this.clauses.active,
        ),
      })) as ITodo[];
    } catch (error) {
      return throwDbError("Error getting todos for user", error);
    }
  }

  async getByOrganizationId(organizationId: string): Promise<ITodo[]> {
    try {
      return (await db.query.todos.findMany({
        with: defaultWith,
        where: and(eq(todos.organizationId, organizationId), this.clauses.active),
      })) as ITodo[];
    } catch (error) {
      return throwDbError("Error getting todos for organization", error);
    }
  }

  async getByTeamId(teamId: string): Promise<ITodo[]> {
    try {
      return (await db.query.todos.findMany({
        with: defaultWith,
        where: and(eq(todos.teamId, teamId), this.clauses.active),
      })) as ITodo[];
    } catch (error) {
      return throwDbError("Error getting todos for team", error);
    }
  }
}
