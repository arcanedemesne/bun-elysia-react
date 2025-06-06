import Elysia from "elysia";

import { UserService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, userRoute } from "@/lib/constants";
import { IUser, IUserInsert, IUserUpdate } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

import { BaseController } from "./BaseController";

export const UserController = (app: Elysia<any, any, any, any, JwtContext>) => {
  const getService = (userId?: string) => new UserService(userId);

  app.group(`/${apiPrefix}/${userRoute}`, (group) =>
    group.get(`/search`, async ({ user, query }: { user: IUser; query: { searchQuery: string } }) => {
      const service = getService(user.id);
      if (query.searchQuery) {
        return await service.search(query);
      }
      return ResponseError.throw({
        status: StatusCodes.BAD_REQUEST,
        statusText: ReasonPhrases.BAD_REQUEST,
        message: `Invalid search criteria`,
      });
    }),
  );

  BaseController<IUser, IUserInsert, IUserUpdate>(app, userRoute, getService);

  return app;
};
