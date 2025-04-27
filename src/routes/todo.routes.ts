import Elysia from "elysia";

import { apiPrefix, todoRoute } from "../constants";
import { todoRepository } from "../respositories";
import { JwtContext, ToDoInsert, ResponseError } from "../types";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

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
          throw new ResponseError({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `ToDo with title ${(parsed as ToDoInsert).title} could not be created`,
          });
        }
        return todo;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const success = await todoRepository().deleteToDo(id);
        if (!success) {
          throw new ResponseError({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `ToDo with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
