import Elysia from "elysia";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, teamRoute } from "@/lib/constants";
import { TeamInsertDTO, TeamUpdateDTO } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

import { TeamService } from "../services";

export const teamRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${teamRoute}`, (group) =>
    group
      .get(``, async ({ user, query }) => {
        const service = new TeamService(user);
        if (query.userId) {
          return await service.getByUserId(query.userId);
        }
        return await service.getAll();
      })
      .get(`/:id`, async ({ user, params: { id } }) => {
        const service = new TeamService(user);
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
      .post(``, async ({ user, body }) => {
        const parsed = JSON.parse(body as string) as TeamInsertDTO;
        const service = new TeamService(user);
        const entity = await service.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Team with name ${parsed.name} could not be created`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ user, params: { id }, body }) => {
        const parsed = JSON.parse(body as string) as TeamUpdateDTO;
        const service = new TeamService(user);

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
      .delete(`/:id`, async ({ user, params: { id } }) => {
        const service = new TeamService(user);
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
