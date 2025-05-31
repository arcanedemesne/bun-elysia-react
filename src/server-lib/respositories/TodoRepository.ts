import { and, eq, isNull } from "drizzle-orm";

import { ITodo, ITodoInsert, ITodoUpdate } from "@/lib/models";

import { db } from "../../data/db";
import { todos } from "../../data/schema";
import { IRepository } from "./IRepository";
import { throwDbError, withRelations } from "./utilities";

const clauses = {
  active: eq(todos.active, true),
};

export class TodoRepository implements IRepository<ITodo, ITodoInsert, ITodoUpdate> {
  constructor(public userId: string) {}

  // #region CRUD
  async getAll(): Promise<ITodo[]> {
    try {
      return (await db.query.todos.findMany({
        with: { ...withRelations.user, organization: true, team: true },
        where: clauses.active,
      })) as ITodo[];
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async getById(id: string): Promise<ITodo | null> {
    try {
      return (await db.query.todos.findFirst({
        with: { ...withRelations.user, organization: true, team: true },
        where: and(eq(todos.id, id), clauses.active),
      })) as ITodo | null;
    } catch (error) {
      return throwDbError("Error getting todo by id", error);
    }
  }

  async insert(payload: ITodoInsert): Promise<ITodo | null> {
    try {
      const insertPayload = { ...payload, createdBy: this.userId };
      const entities = await db.insert(todos).values(insertPayload).returning();

      if (entities.length === 0) {
        throw new Error(`Could not insert todo with title ${payload.title}`);
      }
      return entities[0] as ITodo;
    } catch (error) {
      return throwDbError("Error inserting todo", error);
    }
  }

  async update(payload: ITodoUpdate): Promise<ITodo | null> {
    try {
      const updatePayload = { ...payload, updatedBy: this.userId };
      const entities = await db.update(todos).set(updatePayload).where(eq(todos.id, payload.id)).returning();

      if (entities.length === 0) {
        throw new Error(`Could not update todo with id ${payload.id}`);
      }
      return entities[0] as ITodo;
    } catch (error) {
      return throwDbError("Error updating todo", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await this.getById(id);

      if (existingEntity) {
        const entity = await this.update({
          id,
          deletedAt: new Date(),
          deletedBy: this.userId,
          active: false,
        });
        if (!entity?.active) {
          return true; // soft deleted successfully
        }
      } else {
        const entities = await db.delete(todos).where(eq(todos.id, id)).returning();

        if (entities.length > 0) {
          return true; // hard deleted successfully
        }
      }

      throw new Error();
    } catch (error) {
      return throwDbError("Error deleting todo", error);
    }
  }
  // #endregion

  async getByUserId(userId: string): Promise<ITodo[]> {
    try {
      return (await db.query.todos.findMany({
        with: { ...withRelations.user, organization: true, team: true },
        where: and(eq(todos.createdBy, userId), isNull(todos.organizationId), isNull(todos.teamId), clauses.active),
      })) as ITodo[];
    } catch (error) {
      return throwDbError("Error getting todos for user", error);
    }
  }

  async getByOrganizationId(organizationId: string): Promise<ITodo[]> {
    try {
      return (await db.query.todos.findMany({
        with: { ...withRelations.user, organization: true, team: true },
        where: and(eq(todos.organizationId, organizationId), clauses.active),
      })) as ITodo[];
    } catch (error) {
      return throwDbError("Error getting todos for organization", error);
    }
  }

  async getByTeamId(teamId: string): Promise<ITodo[]> {
    try {
      return (await db.query.todos.findMany({
        with: { ...withRelations.user, organization: true, team: true },
        where: and(eq(todos.teamId, teamId), clauses.active),
      })) as ITodo[];
    } catch (error) {
      return throwDbError("Error getting todos for team", error);
    }
  }
}
