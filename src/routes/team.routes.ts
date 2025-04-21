import Elysia, { error } from "elysia";
import { apiPrefix, teamRoute } from "../constants";
import teamRepository from "../respositories/teamRepository";
import { TeamInsert } from "../types/Team/TeamInsert";

export const teamRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${teamRoute}`, (group) =>
    group
      .get(``, async () => await teamRepository().getTeams())
      .get(
        `?userId=:userId`,
        async ({ params: { userId } }) =>
          await teamRepository().getTeamsByUserId(userId),
      )
      .get(`/:id`, async ({ params: { id } }) => {
        const team = await teamRepository().getTeamById(id);
        if (!team) {
          error(404);
        }
        return team;
      })
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string);
        const team = await teamRepository().insertTeam(parsed as TeamInsert);
        if (!team) {
          error(409);
        }
        return team;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const success = await teamRepository().deleteTeam(id);
        if (!success) {
          error(404);
        }
      }),
  );
};
