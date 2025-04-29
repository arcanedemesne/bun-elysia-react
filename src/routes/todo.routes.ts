import Elysia from "elysia";

import { apiPrefix, todoRoute } from "../constants";
import { TodoRepository } from "../respositories";
import { JwtContext, ToDoInsert, ResponseError, ToDoUpdate } from "../types";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const todoRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  const repo = new TodoRepository();

  return app.group(`/${apiPrefix}/${todoRoute}`, (group) =>
    group
      .get(``, async () => await repo.getAll())
      .get(`/:userId`, async ({ params: { userId } }) => {
        return await repo.getByUserId(userId);
      })
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string) as ToDoInsert;
        const entity = await repo.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `ToDo with title ${parsed.title} could not be created`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ params: { id }, body }) => {
        const parsed = JSON.parse(body as string) as ToDoUpdate;

        if (id !== parsed.id) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `ToDo with id ${parsed.id} did not match route id ${id}`,
          });
        }

        const entity = await repo.update(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `ToDo with id ${parsed.id} could not be updated`,
          });
        }
        return entity;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const success = await repo.delete(id);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `ToDo with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
