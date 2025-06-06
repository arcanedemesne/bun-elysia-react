import Elysia from "elysia";

import { TodoService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { ITodo, ITodoInsert, ITodoUpdate, IUser } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

import { BaseController } from "./BaseController";

export const TodoController = (app: Elysia<any, any, any, any, JwtContext>) => {
  const getService = (userId?: string) => new TodoService(userId!);

  app.group(`/${apiPrefix}/${todoRoute}`, (group) =>
    group
      .get(`/user/:userId`, async ({ user, params: { userId } }: { user: IUser; params: { userId: string } }) => {
        const service = getService(user.id);
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
          const service = getService(user.id);
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
        const service = getService(user.id);
        if (teamId) {
          return await service.getByTeamId(teamId);
        }
        return ResponseError.throw({
          status: StatusCodes.BAD_REQUEST,
          statusText: ReasonPhrases.BAD_REQUEST,
          message: `Invalid team id`,
        });
      }),
  );

  BaseController<ITodo, ITodoInsert, ITodoUpdate>(app, todoRoute, getService);

  return app;
};
