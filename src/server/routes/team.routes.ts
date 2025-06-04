import Elysia from "elysia";

import { TeamService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, teamRoute } from "@/lib/constants";
import { ITeamInsert, ITeamMemberDTO, ITeamUpdate, IUser } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const teamRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${teamRoute}`, (group) =>
    group
      .get(``, async ({ user }: { user: IUser }) => {
        const service = new TeamService(user.id);

        return await service.getAll();
      })
      .get(`/user/:userId`, async ({ user, params: { userId } }: { user: IUser; params: { userId: string } }) => {
        const service = new TeamService(user.id);
        return await service.getByUserId(userId);
      })
      .get(
        `/organization/:organizationId`,
        async ({ user, params: { organizationId } }: { user: IUser; params: { organizationId: string } }) => {
          const service = new TeamService(user.id);
          return await service.getByOrganizationId(organizationId);
        },
      )
      .get(`/:id`, async ({ user, params: { id } }: { user: IUser; params: { id: string } }) => {
        const service = new TeamService(user.id);
        const entity = await service.getById(id);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Team with id "${id}" could not be found`,
          });
        }
        return entity;
      })
      .post(`/members`, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as ITeamMemberDTO;
        const service = new TeamService(user.id);
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
        const service = new TeamService(user.id);
        const success = await service.removeMember(parsed);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User could not be removed from team`,
          });
        }
      })
      .post(``, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as ITeamInsert;
        const service = new TeamService(user.id);
        const entity = await service.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Team with name ${parsed.name} could not be created`,
          });
        }
        const member = await service.addMember({ userId: user.id, teamId: entity?.id });
        if (!member) {
          await service.delete(entity?.id);
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User ${user.username} could not be added to Team ${parsed.name}`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ user, params: { id }, body }: { user: IUser; params: { id: string }; body: any }) => {
        const parsed = JSON.parse(body as string) as ITeamUpdate;
        const service = new TeamService(user.id);

        if (id !== parsed.id) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Todo with id ${parsed.id} did not match route id ${id}`,
          });
        }

        const entity = await service.update(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Todo with id ${parsed.id} could not be updated`,
          });
        }
        return entity;
      })
      .delete(`/:id`, async ({ user, params: { id } }: { user: IUser; params: { id: string } }) => {
        const service = new TeamService(user.id);
        const success = await service.delete(id);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Team with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
