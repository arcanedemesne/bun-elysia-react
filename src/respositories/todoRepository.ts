import sql from "../db";
import { z } from "zod";

import { ToDo, ToDoInsert } from "../types";

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

export const todoRepository = () => {
  return {
    async getToDos(): Promise<ToDo[]> {
      try {
        const todos = await sql`
          SELECT t.id, t.title, t.description, t."teamId",
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
          t."createdOn"
          FROM todos t`;

        const validatedTodos = todosSchema.parse(todos);
        return validatedTodos as ToDo[];
      } catch (error) {
        console.error("Error getting todos:", error);
        return [];
      }
    },
    async getToDosByUserId(userId: string): Promise<ToDo[]> {
      try {
        const todos = await sql`
          SELECT t.id, t.title, t.description, t."teamId", 
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
          t."createdOn"
          FROM todos t WHERE t."createdBy" = ${userId} AND t."teamId" IS NULL`;

        const validatedTodos = todosSchema.parse(todos);
        return validatedTodos as ToDo[];
      } catch (error) {
        console.error("Error getting todos:", error);
        return [];
      }
    },
    async getToDosByTeamId(teamId: string): Promise<ToDo[]> {
      try {
        const todos = await sql`
          SELECT t.id, t.title, t.description, t."teamId", 
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
          t."createdOn"
          FROM todos t WHERE t."teamId" = ${teamId}`;

        const validatedTodos = todosSchema.parse(todos);
        return validatedTodos as ToDo[];
      } catch (error) {
        console.error("Error getting todos:", error);
        return [];
      }
    },
    async insertToDo(todoData: ToDoInsert): Promise<ToDo | null> {
      try {
        const validatedTodoData = todoInsertSchema.parse(todoData);

        const insertedTodos =
          await sql`INSERT INTO todos (title, description, "teamId", "createdBy")
          VALUES (${validatedTodoData.title}, ${todoData.description ?? null}, ${todoData.teamId ?? null}, ${validatedTodoData.createdBy})
          RETURNING id, title, description, "teamId",
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
            FROM users u WHERE u.id = "createdBy") AS "createdBy",
          "createdOn"`;

        if (insertedTodos.length === 0) {
          return null; // Insertion failed
        }

        const validatedTodo = todoSchema.parse(insertedTodos[0]);
        return validatedTodo as ToDo; // Return the inserted user
      } catch (error) {
        console.error("Error inserting todo:", error);
        return null;
      }
    },
    async deleteToDo(id: string): Promise<boolean> {
      try {
        const result = await sql`DELETE FROM todos WHERE id = ${id}`;

        // Check if any rows were deleted
        if (result.count > 0) {
          return true; // User deleted successfully
        } else {
          return false; // User not found
        }
      } catch (error) {
        console.error("Error deleting todo:", error);
        return false;
      }
    },
  };
};
