import Elysia from "elysia";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, teamRoute } from "@/lib/constants";
import { TeamInsert, TeamUpdate } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

import { TeamRepository } from "../respositories";

export const teamRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  const repo = new TeamRepository();

  return app.group(`/${apiPrefix}/${teamRoute}`, (group) =>
    group
      .get(``, async ({ query }) => {
        if (query.userId) {
          return await repo.getTeamsByUserId(query.userId);
        }
        return await repo.getAll();
      })
      .get(`/:id`, async ({ params: { id } }) => {
        const entity = await repo.getById(id);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.NOT_FOUND,
            statusText: ReasonPhrases.NOT_FOUND,
            message: `Team with id "${id}" could not be found`,
          });
        }
        return entity;
      })
      .post(``, async ({ body }) => {
        const parsed = JSON.parse(body as string) as TeamInsert;
        const entity = await repo.insert(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `Team with name ${parsed.name} could not be created`,
          });
        }
        return entity;
      })
      .put(`/:id`, async ({ params: { id }, body }) => {
        const parsed = JSON.parse(body as string) as TeamUpdate;

        if (id !== parsed.id) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `ToDo with id ${parsed.id} did not match route id ${id}`,
          });
        }

        const entity = await repo.update(parsed);
        if (!entity) {
          return ResponseError.throw({
            status: StatusCodes.CONFLICT,
            statusText: ReasonPhrases.CONFLICT,
            message: `ToDo with id ${parsed.id} could not be updated`,
          });
        }
        return entity;
      })
      .delete(`/:id`, async ({ params: { id } }) => {
        const success = await repo.delete(id);
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
