import { and, eq, isNull } from "drizzle-orm";

import {
  Todo,
  TodoDTO,
  TodoInsertDTO,
  TodoUpdateDTO,
  User,
} from "@/lib/models";

import { db } from "../data/db";
import { teams, todos, users } from "../data/schema";
import { IRepository } from "./IRepository";
import { throwDbError } from "./utilities";
import { alias } from "drizzle-orm/pg-core";

const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");
const deletedBy = alias(users, "deletedBy");

export class TodoRepository
  implements IRepository<Todo, TodoDTO, TodoInsertDTO, TodoUpdateDTO>
{
  constructor(public user: User) {}

  selectDTO = {
    id: todos.id,
    title: todos.title,
    description: todos.description,
    teamId: todos.teamId,
    createdAt: todos.createdAt,
    updatedAt: todos.updatedAt,
    deletedAt: todos.deletedAt,
    createdBy: {
      id: createdBy.id,
      username: createdBy.username,
    },
    updatedBy: {
      id: updatedBy.id,
      username: updatedBy.username,
    },
    deletedBy: {
      id: deletedBy.id,
      username: deletedBy.username,
    },
  };

  async getAll(): Promise<TodoDTO[]> {
    try {
      const data = await db
        .select(this.selectDTO)
        .from(todos)
        .innerJoin(createdBy, eq(todos.createdBy, createdBy.id))
        .fullJoin(updatedBy, eq(todos.updatedBy, updatedBy.id))
        .fullJoin(deletedBy, eq(todos.deletedBy, deletedBy.id))
        .where(eq(todos.active, true));
      return data as TodoDTO[];
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async getById(id: string): Promise<TodoDTO | null> {
    try {
      const data = await db
        .select(this.selectDTO)
        .from(todos)
        .innerJoin(createdBy, eq(todos.createdBy, createdBy.id))
        .fullJoin(updatedBy, eq(todos.updatedBy, updatedBy.id))
        .fullJoin(deletedBy, eq(todos.deletedBy, deletedBy.id))
        .where(and(eq(todos.id, id), eq(todos.active, true)));

      if (data.length === 0) {
        return null;
      }

      return data[0] as TodoDTO;
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async getByUserId(userId: string): Promise<TodoDTO[]> {
    try {
      const data = await db
        .select(this.selectDTO)
        .from(todos)
        .innerJoin(createdBy, eq(todos.createdBy, createdBy.id))
        .fullJoin(updatedBy, eq(todos.updatedBy, updatedBy.id))
        .fullJoin(deletedBy, eq(todos.deletedBy, deletedBy.id))
        .where(
          and(
            eq(todos.createdBy, userId),
            isNull(todos.teamId),
            eq(todos.active, true),
          ),
        );
      return data as TodoDTO[];
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async getByTeamId(teamId: string): Promise<TodoDTO[]> {
    try {
      const data = await db
        .select(this.selectDTO)
        .from(todos)
        .innerJoin(teams, eq(todos.teamId, teams.id))
        .innerJoin(createdBy, eq(todos.createdBy, createdBy.id))
        .fullJoin(updatedBy, eq(todos.updatedBy, updatedBy.id))
        .fullJoin(deletedBy, eq(todos.deletedBy, deletedBy.id))
        .where(and(eq(todos.teamId, teamId), eq(todos.active, true)));
      return data as TodoDTO[];
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async insert(insertData: TodoInsertDTO): Promise<Todo | null> {
    try {
      const data = await db
        .insert(todos)
        .values({ ...insertData, createdBy: this.user.id })
        .returning();

      if (data.length === 0) {
        return null;
      }

      return data[0] as Todo;
    } catch (error) {
      return throwDbError("Error inserting todo", error);
    }
  }

  async update(updateData: TodoUpdateDTO): Promise<Todo | null> {
    try {
      const { id, ...rest } = { ...updateData, updatedBy: this.user.id };
      const data = await db
        .update(todos)
        .set(rest)
        .where(eq(todos.id, id))
        .returning();

      if (data.length === 0) {
        return null; // Update failed
      }

      return data[0] as Todo;
    } catch (error) {
      return throwDbError("Error updating todo", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await db
        .select()
        .from(todos)
        .where(eq(todos.id, id));
      let data;
      if (existingEntity.length > 0) {
        data = await this.update({
          id: existingEntity[0].id,
          deletedBy: this.user.id,
          active: false,
        });
        if (data?.id) {
          return true; // soft deleted successfully
        }
      } else {
        data = await db.delete(todos).where(eq(todos.id, id)).returning();
        if (data) {
          return true; // hard deleted successfully
        }
      }

      return false; // unsuccessful delete
    } catch (error) {
      return throwDbError("Error deleting todo", error);
    }
  }
}
