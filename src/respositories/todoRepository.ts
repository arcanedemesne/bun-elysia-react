import sql from "../db";
import { z } from "zod";

import {
  IRepository,
  ResponseError,
  ToDo,
  ToDoInsert,
  ToDoUpdate,
} from "../types";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { throwDbError } from "./utilities";

const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
});

const todoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional().nullable(),
  teamdId: z.string().optional().nullable(),
  createdBy: userSchema,
  createdOn: z.date(),
});

const todosSchema = z.array(todoSchema);

const todoInsertSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  createdBy: z.string(),
});

const todoUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional().nullable(),
});

export class TodoRepository
  implements IRepository<ToDo, ToDoInsert, ToDoUpdate>
{
  async getAll(): Promise<ToDo[]> {
    try {
      const data = await sql`
          SELECT t.id, t.title, t.description, t."teamId",
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
          t."createdOn"
          FROM todos t`;

      const validatedData = todosSchema.parse(data);
      return validatedData as ToDo[];
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async getById(id: string): Promise<ToDo | null> {
    try {
      const data = await sql`
          SELECT t.id, t.title, t.description, t."teamId", 
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
          t."createdOn"
          FROM todos t WHERE t.id = ${id}`;

      if (data.length === 0) {
        return null; // Insertion failed
      }

      const validatedData = todoSchema.parse(data[0]);
      return validatedData as ToDo;
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async getByUserId(userId: string): Promise<ToDo[]> {
    try {
      const data = await sql`
          SELECT t.id, t.title, t.description, t."teamId", 
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
          t."createdOn"
          FROM todos t WHERE t."createdBy" = ${userId} AND t."teamId" IS NULL`;

      const validatedData = todosSchema.parse(data);
      return validatedData as ToDo[];
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async getByTeamId(teamId: string): Promise<ToDo[]> {
    try {
      const data = await sql`
          SELECT t.id, t.title, t.description, t."teamId", 
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
          t."createdOn"
          FROM todos t WHERE t."teamId" = ${teamId}`;

      const validatedData = todosSchema.parse(data);
      return validatedData as ToDo[];
    } catch (error) {
      return throwDbError("Error getting todos", error);
    }
  }

  async insert(todoData: ToDoInsert): Promise<ToDo | null> {
    try {
      const validatedInsertData = todoInsertSchema.parse(todoData);

      const data =
        await sql`INSERT INTO todos (title, description, "teamId", "createdBy")
          VALUES (${validatedInsertData.title}, ${todoData.description ?? null}, ${todoData.teamId ?? null}, ${validatedInsertData.createdBy})
          RETURNING id, title, description, "teamId",
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
            FROM users u WHERE u.id = "createdBy") AS "createdBy",
          "createdOn"`;

      if (data.length === 0) {
        return null; // Insertion failed
      }

      const insertedData = todoSchema.parse(data[0]);
      return insertedData as ToDo;
    } catch (error) {
      return throwDbError("Error inserting todo", error);
    }
  }

  async update(updateData: ToDoUpdate): Promise<ToDo | null> {
    try {
      const validatedUpdateData = todoUpdateSchema.parse(updateData);

      // Build the SET clause dynamically
      const setClauses: string[] = [];
      const values: any[] = [];
      let valueIndex = 1; // Start at 1 for parameterized queries

      if (validatedUpdateData.title !== undefined) {
        setClauses.push(`title = $${valueIndex++}`);
        values.push(validatedUpdateData.title);
      }
      if (validatedUpdateData.description !== undefined) {
        setClauses.push(`description = $${valueIndex++}`);
        values.push(validatedUpdateData.description);
      }

      if (setClauses.length === 0) {
        return null;
      }

      // Build the SQL query
      const setClauseString = setClauses.join(", ");
      const query = `
          UPDATE todos
          SET ${setClauseString}
          WHERE id = $${valueIndex}
          RETURNING id, title, description, "teamId",
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
            FROM users u WHERE u.id = "createdBy") AS "createdBy",
          "createdOn"`;
      values.push(updateData.id);

      const data = await sql.unsafe(query, values);

      if (data.length === 0) {
        return null; // Update failed
      }

      const updatedData = todoSchema.parse(data[0]);
      return updatedData as ToDo;
    } catch (error) {
      return throwDbError("Error inserting todo", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM todos WHERE id = ${id}`;

      // Check if any rows were deleted
      if (result.count > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return throwDbError("Error deleting todo", error);
    }
  }
}
