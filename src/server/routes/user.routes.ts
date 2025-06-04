import Elysia from "elysia";

import { UserService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, userRoute } from "@/lib/constants";
import { IUser, IUserInsert, IUserUpdate } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const userRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${userRoute}`, (group) =>
    group
      .get(``, async ({ user }: { user: IUser }) => {
        const service = new UserService(user.id);
        return await service.getAll();
      })
      .get(`/search`, async ({ query, user }: { query: { searchQuery: string }; user: IUser }) => {
        const service = new UserService(user.id);
        if (query.searchQuery) {
          return await service.search(query);
        }
        return ResponseError.throw({
          status: StatusCodes.BAD_REQUEST,
          statusText: ReasonPhrases.BAD_REQUEST,
          message: `Invalid search criteria`,
        });
      })
      .get(`/:id`, async ({ params: { id }, user }: { params: { id: string }; user: IUser }) => {
        const service = new UserService(user.id);
        const entity = await service.getById(id);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User with id "${id}" could not be found`,
          });
        }
        return entity;
      })
      .post(``, async ({ body, user }: { body: any; user: IUser }) => {
        const parsed = JSON.parse(body as string) as IUserInsert;
        const service = new UserService(user.id);
        let entity = await service.getByUsername(parsed.username);
        if (entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with username ${parsed.username} already exists`,
          });
        }
        entity = await service.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with username ${parsed.username} could not be created`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ params: { id }, body, user }: { params: { id: string }; body: any; user: IUser }) => {
        const parsed = JSON.parse(body as string) as IUserUpdate;
        const service = new UserService(user.id);

        if (id !== parsed.id) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with id ${parsed.id} did not match route id ${id}`,
          });
        }

        const entity = await service.update(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with id ${parsed.id} could not be updated`,
          });
        }
        return entity;
      })
      .delete(`/:id`, async ({ params: { id }, user }: { params: { id: string }; user: IUser }) => {
        const service = new UserService(user.id);
        const success = await service.delete(id);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
