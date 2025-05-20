import Elysia from "elysia";

import { TodoService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { TodoInsertDTO, TodoUpdateDTO } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const todoRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${todoRoute}`, (group) =>
    group
      .get(``, async ({ user, query }) => {
        const service = new TodoService(user);
        if (query.userId) {
          return await service.getByUserId(query.userId);
        }
        if (query.teamId) {
          return await service.getByTeamId(query.teamId);
        }
        return await service.getAll();
      })
      .get(`/:id`, async ({ user, params: { id } }) => {
        const service = new TodoService(user);
        const todo = await service.getById(id);
        if (!todo) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Todo with id "${id}" could not be found`,
          });
        }
        return todo;
      })
      .post(``, async ({ user, body }) => {
        const parsed = JSON.parse(body as string) as TodoInsertDTO;
        const service = new TodoService(user);
        const entity = await service.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Todo with title ${parsed.title} could not be created`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ user, params: { id }, body }) => {
        const parsed = JSON.parse(body as string) as TodoUpdateDTO;

        if (id !== parsed.id) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Todo with id ${parsed.id} did not match route id ${id}`,
          });
        }

        const service = new TodoService(user);
        const entity = await service.update(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Todo with id ${parsed.id} could not be updated`,
          });
        }
        return entity;
      })
      .delete(`/:id`, async ({ user, params: { id } }) => {
        const service = new TodoService(user);
        const success = await service.delete(id);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Todo with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
