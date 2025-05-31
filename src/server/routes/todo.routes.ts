import Elysia from "elysia";

import { TodoService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { ITodoInsert, ITodoUpdate, IUser } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const todoRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${todoRoute}`, (group) =>
    group
      .get(``, async ({ user }: { user: IUser }) => {
        const service = new TodoService(user.id);
        return await service.getAll();
      })
      .get(`/user/:userId`, async ({ user, params: { userId } }: { user: IUser; params: { userId: string } }) => {
        const service = new TodoService(user.id);
        if (userId) {
          return await service.getByUserId(userId);
        }
        return ResponseError.throw({
          status: StatusCodes.BAD_REQUEST,
          statusText: ReasonPhrases.BAD_REQUEST,
          message: `Invalid user id`,
        });
      })
      .get(
        `/organization/:organizationId`,
        async ({ user, params: { organizationId } }: { user: IUser; params: { organizationId: string } }) => {
          const service = new TodoService(user.id);
          if (organizationId) {
            return await service.getByOrganizationId(organizationId);
          }
          return ResponseError.throw({
            status: StatusCodes.BAD_REQUEST,
            statusText: ReasonPhrases.BAD_REQUEST,
            message: `Invalid organization id`,
          });
        },
      )
      .get(`/team/:teamId`, async ({ user, params: { teamId } }: { user: IUser; params: { teamId: string } }) => {
        const service = new TodoService(user.id);
        if (teamId) {
          return await service.getByTeamId(teamId);
        }
        return ResponseError.throw({
          status: StatusCodes.BAD_REQUEST,
          statusText: ReasonPhrases.BAD_REQUEST,
          message: `Invalid team id`,
        });
      })
      .get(`/:id`, async ({ user, params: { id } }: { user: IUser; params: { id: string } }) => {
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
      .post(``, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as ITodoInsert;
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
      .put(`/:id`, async ({ user, params: { id }, body }: { user: IUser; params: { id: string }; body: any }) => {
        const parsed = JSON.parse(body as string) as ITodoUpdate;

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
      .delete(`/:id`, async ({ user, params: { id } }: { user: IUser; params: { id: string } }) => {
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
