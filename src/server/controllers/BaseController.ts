import Elysia from "elysia";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix } from "@/lib/constants";
import { IUpdateEntity, IUser } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

import { IBaseService } from "src/server-lib/services";

export const BaseController = <IEntity, IInsert, IUpdate>(
  app: Elysia<any, any, any, any, JwtContext>,
  routePrefix: string,
  getService: (userId?: string) => IBaseService<IEntity, IInsert, IUpdate>,
) => {
  return app.group(`/${apiPrefix}/${routePrefix}`, (group) =>
    group
      .get(``, async ({ user }: { user: IUser }) => {
        return await getService(user.id).getAll();
      })
      .get(`/:id`, async ({ user, params: { id } }: { user: IUser; params: { id: string } }) => {
        const service = getService(user.id);
        const message = await service.getById(id);
        if (!message) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `${service.entityTypeName} with id "${id}" could not be found`,
          });
        }
        return message;
      })
      .post(``, async ({ user, body }: { user: IUser; body: any }) => {
        const parsed = JSON.parse(body as string) as IInsert;
        const service = getService(user.id);
        const entity = await service.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `${service.entityTypeName} could not be created`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ user, params: { id }, body }: { user: IUser; params: { id: string }; body: any }) => {
        const parsed = JSON.parse(body as string) as IUpdateEntity;
        const service = getService(user.id);

        if (id !== parsed.id) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `${service.entityTypeName} with id ${parsed.id} did not match route id ${id}`,
          });
        }

        const entity = await service.update(parsed as IUpdate);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `${service.entityTypeName} with id ${parsed.id} could not be updated`,
          });
        }
        return entity;
      })
      .delete(`/:id`, async ({ user, params: { id } }: { user: IUser; params: { id: string } }) => {
        const service = getService(user.id);
        const success = await service.delete(id);
        if (!success) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `${service.entityTypeName} with id "${id}" could not be deleted`,
          });
        }
      }),
  );
};
