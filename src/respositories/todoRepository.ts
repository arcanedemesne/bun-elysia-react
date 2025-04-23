import sql from "../db";
import { z } from "zod";

import { ToDo, ToDoInsert } from "../types";

const todoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  message: z.string(),
});

const todosSchema = z.array(todoSchema);

const todoInsertSchema = z.object({
  userId: z.string().uuid(),
  message: z.string(),
});

export const todoRepository = () => {
  return {
    async getToDos(): Promise<ToDo[]> {
      try {
        const todos = await sql`
          SELECT id, "userId", message
          FROM todos`;

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
          SELECT id, "userId", message
          FROM todos WHERE "userId" = ${userId}`;

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

        const insertedTodos = await sql`
          INSERT INTO todos ("userId", message)
          VALUES (${validatedTodoData.userId}, ${validatedTodoData.message})
          RETURNING id, "userId", message
        `;

        if (insertedTodos.length === 0) {
          return null; // Insertion failed
        }

        return insertedTodos[0] as ToDo; // Return the inserted user
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
