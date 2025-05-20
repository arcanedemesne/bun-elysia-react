import Elysia from "elysia";

import { UserService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, userRoute } from "@/lib/constants";
import { UserInsertDTO, UserUpdateDTO } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const userRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${userRoute}`, (group) =>
    group
      .get(``, async ({ query }) => {
        const service = new UserService();
        if (query.search) {
          return await service.search(query.search);
        }
        return await service.getAll();
      })
      .get(`/:id`, async ({ params: { id } }) => {
        const service = new UserService();
        const user = await service.getById(id);
        if (!user) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User with id "${id}" could not be found`,
          });
        }
        return user;
      })
      .put(`/:id`, async ({ params: { id }, body }) => {
        const parsed = JSON.parse(body as string) as UserUpdateDTO;
        const service = new UserService();

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
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string) as UserInsertDTO;
        const service = new UserService();
        let user = await service.getByUsername(parsed.username);
        if (user) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with username ${parsed.username} already exists`,
          });
        }
        user = await service.insert(parsed);
        if (!user) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with username ${parsed.username} could not be created`,
          });
        }
        return user;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const service = new UserService();
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
