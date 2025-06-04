import Elysia from "elysia";

import { OrganizationService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, memberRoute, organizationRoute } from "@/lib/constants";
import { IOrganizationInsert, IOrganizationMemberDTO, IOrganizationUpdate, IUser } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const organizationRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${organizationRoute}`, (group) =>
    group
      .get(``, async ({ user }: { user: IUser }) => {
        const service = new OrganizationService(user.id);
        return await service.getAll();
      })
      .get(`/user/:userId`, async ({ user, params: { userId } }: { user: IUser; params: { userId: string } }) => {
        const service = new OrganizationService(user.id);
        return await service.getByUserId(userId);
      })
      .get(`/:id`, async ({ user, params: { id } }: { user: IUser; params: { id: string } }) => {
        const service = new OrganizationService(user.id);
        const entity = await service.getById(id);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Organization with id "${id}" could not be found`,
          });
        }
        return entity;
      })
      .post(`/${memberRoute}`, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as IOrganizationMemberDTO;
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
      .delete(`/${memberRoute}`, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as IOrganizationMemberDTO;
        const service = new OrganizationService(user.id);
        const success = await service.removeMember(parsed);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `User could not be removed from organization`,
          });
        }
      })
      .post(``, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as IOrganizationInsert;
        const service = new OrganizationService(user.id);
        const entity = await service.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Organization with name ${parsed.name} could not be created`,
          });
        }
        const member = await service.addMember({ userId: user.id, organizationId: entity?.id });
        if (!member) {
          await service.delete(entity?.id);
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `User ${user.username} could not be added to Organization ${parsed.name}`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ user, params: { id }, body }: { user: IUser; params: { id: string }; body: any }) => {
        const parsed = JSON.parse(body as string) as IOrganizationUpdate;
        const service = new OrganizationService(user.id);

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
        const service = new OrganizationService(user.id);
        const success = await service.delete(id);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Organization with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
