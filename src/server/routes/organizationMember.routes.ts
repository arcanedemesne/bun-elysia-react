import Elysia from "elysia";

import { OrganizationService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, organizationMemberRoute, organizationRoute } from "@/lib/constants";
import { IUser, OrganizationMemberDTO } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const organizationMemberRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${organizationRoute}/${organizationMemberRoute}`, (group) =>
    group
      .post(``, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as OrganizationMemberDTO;
        const service = new OrganizationService(user.id);
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
      .delete(``, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as OrganizationMemberDTO;
        const service = new OrganizationService(user.id);
        const success = await service.removeMember(parsed);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User could not be removed from organization`,
          });
        }
      }),
  );
};
