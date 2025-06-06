import Elysia from "elysia";

import { OrganizationService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, memberRoute, organizationRoute } from "@/lib/constants";
import { IOrganization, IOrganizationInsert, IOrganizationMemberDTO, IOrganizationUpdate, IUser } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

import { BaseController } from "./BaseController";

export const OrganizationController = (app: Elysia<any, any, any, any, JwtContext>) => {
  const getService = (userId?: string) => new OrganizationService(userId!);

  app.group(`/${apiPrefix}/${organizationRoute}`, (group) =>
    group
      .get(`/user/:userId`, async ({ user, params: { userId } }: { user: IUser; params: { userId: string } }) => {
        const service = getService(user.id);
        return await service.getByUserId(userId);
      })
      .post(`/${memberRoute}`, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as IOrganizationMemberDTO;
        const service = getService(user.id);
        const entity = await service.addMember(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User could not be added to organization`,
          });
        }
        return entity;
      })
      .delete(`/${memberRoute}`, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as IOrganizationMemberDTO;
        const service = getService(user.id);
        const success = await service.removeMember(parsed);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User could not be removed from organization`,
          });
        }
        return success;
      }),
  );

  BaseController<IOrganization, IOrganizationInsert, IOrganizationUpdate>(app, organizationRoute, getService);

  return app;
};
