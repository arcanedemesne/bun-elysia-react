import Elysia from "elysia";

import { apiPrefix, teamRoute, teamMemberRoute } from "../constants";
import { TeamRepository } from "../respositories";
import { JwtContext, ResponseError, TeamMemberDTO } from "../types";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const teamMemberRoutes = (
  app: Elysia<any, any, any, any, JwtContext>,
) => {
  const repo = new TeamRepository();

  return app.group(`/${apiPrefix}/${teamRoute}/${teamMemberRoute}`, (group) =>
    group
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string) as TeamMemberDTO;
        const entity = await repo.addMember(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User could not be added to team`,
          });
        }
        return entity;
      })
      .delete(``, async ({ body }) => {
        const parsed = JSON.parse(body as string) as TeamMemberDTO;
        const success = await repo.removeMember(parsed);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User could not be removed from team`,
          });
        }
      }),
  );
};
