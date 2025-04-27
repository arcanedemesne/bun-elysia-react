import Elysia, { error } from "elysia";

import { apiPrefix, userRoute } from "../constants";
import { userRepository } from "../respositories";
import { UserInsert, JwtContext, ResponseError } from "../types";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const userRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${userRoute}`, (group) =>
    group
      .get(``, async () => await userRepository().getUsers())
      .get(`/:id`, async ({ params: { id } }) => {
        const user = await userRepository().getUserById(id);
        if (!user) {
          throw new ResponseError({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User with id "${id}" could not be found`,
          });
        }
        return user;
      })
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string);
        let user = await userRepository().getUserByUsername(
          (parsed as UserInsert).username,
        );
        if (user) {
          throw new ResponseError({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with username ${(parsed as UserInsert).username} already exists`,
          });
        }
        user = await userRepository().insertUser(parsed as UserInsert);
        if (!user) {
          throw new ResponseError({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User with username ${(parsed as UserInsert).username} could not be created`,
          });
        }
        return user;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const success = await userRepository().deleteUser(id);
        if (!success) {
          throw new ResponseError({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
