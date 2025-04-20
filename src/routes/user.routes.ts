import Elysia, { error } from "elysia";
import { apiPrefix, userRoute } from "../constants";
import userRepository from "../respositories/userRepository";
import { UserInsert } from "../types/User/UserInsert";

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
        const user = await userRepository().insertUser(parsed as UserInsert);
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
