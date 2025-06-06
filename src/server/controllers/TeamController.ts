import Elysia from "elysia";

import { TeamService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, teamRoute } from "@/lib/constants";
import { ITeam, ITeamInsert, ITeamMemberDTO, ITeamUpdate, IUser } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

import { BaseController } from "./BaseController";

export const TeamController = (app: Elysia<any, any, any, any, JwtContext>) => {
  const getService = (userId?: string) => new TeamService(userId!);

  app.group(`/${apiPrefix}/${teamRoute}`, (group) =>
    group
      .get(`/user/:userId`, async ({ user, params: { userId } }: { user: IUser; params: { userId: string } }) => {
        const service = getService(user.id);
        return await service.getByUserId(userId);
      })
      .get(
        `/organization/:organizationId`,
        async ({ user, params: { organizationId } }: { user: IUser; params: { organizationId: string } }) => {
          const service = getService(user.id);
          return await service.getByOrganizationId(organizationId);
        },
      )
      .post(`/members`, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as ITeamMemberDTO;
        const service = getService(user.id);
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
      .delete(`/members`, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as ITeamMemberDTO;
        const service = getService(user.id);
        const success = await service.removeMember(parsed);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User could not be removed from team`,
          });
        }
        return success;
      }),
  );

  BaseController<ITeam, ITeamInsert, ITeamUpdate>(app, teamRoute, getService);

  return app;
};
