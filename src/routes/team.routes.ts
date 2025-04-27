import Elysia, { error } from "elysia";

import { apiPrefix, teamRoute } from "../constants";
import { teamRepository } from "../respositories";
import { TeamInsert, JwtContext, ResponseError } from "../types";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

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
          throw new ResponseError({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Team with id "${id}" could not be found`,
          });
        }
        return team;
      })
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string);
        const team = await teamRepository().insertTeam(parsed as TeamInsert);
        if (!team) {
          throw new ResponseError({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Team with name ${(parsed as TeamInsert).name} could not be created`,
          });
        }
        return team;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const success = await teamRepository().deleteTeam(id);
        if (!success) {
          throw new ResponseError({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Team with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
