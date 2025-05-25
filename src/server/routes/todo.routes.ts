import Elysia from "elysia";

import { TodoService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { TodoInsertDTO, TodoUpdateDTO, User } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const todoRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${todoRoute}`, (group) =>
    group
      .get(``, async ({ user, query }: { user: User; query: any }) => {
        const service = new TodoService(user.id);
        if (query.userId) {
          return await service.getByUserId(query.userId);
        } else if (query.teamId) {
          return await service.getByTeamId(query.teamId);
        } else if (query.organizationId) {
          return await service.getByOrganizationId(query.organizationId);
        }
        return await service.getAll();
      })
      .get(`/:id`, async ({ user, params: { id } }: { user: User; params: { id: string } }) => {
        const service = new TodoService(user.id);
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
      .post(``, async ({ user, body }: { user: User; body: any }) => {
        const parsed = JSON.parse(body as string) as TodoInsertDTO;
        const service = new TodoService(user.id);
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
      .put(`/:id`, async ({ user, params: { id }, body }: { user: User; params: { id: string }; body: any }) => {
        const parsed = JSON.parse(body as string) as TodoUpdateDTO;

        if (id !== parsed.id) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Todo with id ${parsed.id} did not match route id ${id}`,
          });
        }

        const service = new TodoService(user.id);
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
      .delete(`/:id`, async ({ user, params: { id } }: { user: User; params: { id: string } }) => {
        const service = new TodoService(user.id);
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
