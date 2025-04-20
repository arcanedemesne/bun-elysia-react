import Elysia, { error } from "elysia";
import { apiPrefix, todoRoute } from "../constants";
import todoRepository from "../respositories/todoRepository";
import { ToDoInsert } from "../types/ToDo/ToDoInsert";

export const todoRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${todoRoute}`, (group) =>
    group
      .get(``, async () => await todoRepository().getToDos())
      .get(`/:userId`, async ({ params: { userId } }) => {
        return await todoRepository().getToDosByUserId(userId);
      })
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string);
        const todo = await todoRepository().insertToDo(parsed as ToDoInsert);
        if (!todo) {
          error(409);
        }
        return todo;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const success = await todoRepository().deleteToDo(id);
        if (!success) {
          error(404);
        }
      }),
  );
};
