import Elysia, { error } from "elysia";

import { apiPrefix, teamRoute } from "../constants";
import { teamRepository } from "../respositories";
import { TeamInsert, JwtContext } from "../types";

export const teamRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${teamRoute}`, (group) =>
    group
      .get(``, async ({ query }) => {
        if (query.userId) {
          return await teamRepository().getTeamsByUserId(query.userId);
        }
        return await teamRepository().getTeams();
      })
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
