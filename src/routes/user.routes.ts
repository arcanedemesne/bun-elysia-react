import Elysia from "elysia";

import { apiPrefix, userRoute } from "../constants";
import { UserRepository } from "../respositories";
import { UserInsert, JwtContext, ResponseError } from "../types";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const userRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  const repo = new UserRepository();

  return app.group(`/${apiPrefix}/${userRoute}`, (group) =>
    group
      .get(``, async ({ query }) => {
        if (query.search) {
          return await repo.search(query.search);
        }
        return await repo.getAll();
      })
      .get(`/:id`, async ({ params: { id } }) => {
        const user = await repo.getById(id);
        if (!user) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User with id "${id}" could not be found`,
          });
        }
        return user;
      })
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string) as UserInsert;
        let user = await repo.getByUsername(parsed.username);
        if (user) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with username ${parsed.username} already exists`,
          });
        }
        user = await repo.insert(parsed);
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
        const success = await repo.delete(id);
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
