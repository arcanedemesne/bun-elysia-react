import Elysia, { error } from "elysia";

import { apiPrefix, userRoute } from "../constants";
import { userRepository } from "../respositories";
import { UserInsert ,JwtContext } from "../types";

export const userRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${userRoute}`, (group) =>
    group
      .get(``, async () => await userRepository().getUsers())
      .get(`/:id`, async ({ params: { id } }) => {
        const user = await userRepository().getUserById(id);
        if (!user) {
          error(404);
        }
        return user;
      })
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string);
        let user = await userRepository().getUserByUsername((parsed as UserInsert).username);
        if (user) {
          error(409);
        }
        user = await userRepository().insertUser(parsed as UserInsert);
        if (!user) {
          error(409);
        }
        return user;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const success = await userRepository().deleteUser(id);
        if (!success) {
          error(404);
        }
      }),
  );
};
