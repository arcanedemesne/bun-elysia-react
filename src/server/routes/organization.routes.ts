import Elysia from "elysia";

import { OrganizationService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, organizationRoute } from "@/lib/constants";
import { OrganizationInsertDTO, OrganizationUpdateDTO, User } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

export const organizationRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${organizationRoute}`, (group) =>
    group
      .get(``, async ({ user, query }: { user: User; query: any }) => {
        const service = new OrganizationService(user.id);
        if (query.userId) {
          return await service.getByUserId(query.userId);
        }
        return await service.getAll();
      })
      .get(`/:id`, async ({ user, params: { id } }: { user: User; params: { id: string } }) => {
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
      .post(``, async ({ user, body }: { user: User; body: any }) => {
        const parsed = JSON.parse(body as string) as OrganizationInsertDTO;
        const service = new OrganizationService(user.id);
        const entity = await service.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Organization with name ${parsed.name} could not be created`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ user, params: { id }, body }: { user: User; params: { id: string }; body: any }) => {
        const parsed = JSON.parse(body as string) as OrganizationUpdateDTO;
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
      .delete(`/:id`, async ({ user, params: { id } }: { user: User; params: { id: string } }) => {
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
