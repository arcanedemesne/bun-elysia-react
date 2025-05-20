import Elysia from "elysia";

import { TeamService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, teamMemberRoute, teamRoute } from "@/lib/constants";
import { TeamMemberDTO } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const teamMemberRoutes = (
  app: Elysia<any, any, any, any, JwtContext>,
) => {
  return app.group(`/${apiPrefix}/${teamRoute}/${teamMemberRoute}`, (group) =>
    group
      .post(``, async ({ user, body }) => {
        const parsed = JSON.parse(body as string) as TeamMemberDTO;
        const service = new TeamService(user);
        const entity = await service.addMember(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User could not be added to team`,
          });
        }
        return entity;
      })
      .delete(``, async ({ user, body }) => {
        const parsed = JSON.parse(body as string) as TeamMemberDTO;
        const service = new TeamService(user);
        const success = await service.removeMember(parsed);
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
