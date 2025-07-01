import Elysia from "elysia";

import { MessageService } from "@/server-lib/services";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, messageRoute } from "@/lib/constants";
import { IMessage, IMessageInsert, IMessageUpdate, IUser } from "@/lib/models";
import { JwtContext, ResponseError } from "@/lib/types";

import { BaseController } from "./BaseController";

export const MessageController = (app: Elysia<any, any, any, any, JwtContext>) => {
  const getService = (userId?: string) => new MessageService(userId!);

  app.group(`/${apiPrefix}/${messageRoute}`, (group) =>
    group
      .get(
        `/channel/:channel/:entityId`,
        async ({
          user,
          params: { channel, entityId },
          query,
        }: {
          user: IUser;
          params: { channel: string; entityId: string };
          query: any;
        }) => {
          const service = getService(user.id);
          if (channel && entityId) {
            return await service.getByChannel(channel, entityId, query?.before);
          }
          return ResponseError.throw({
            status: StatusCodes.BAD_REQUEST,
            statusText: ReasonPhrases.BAD_REQUEST,
            message: `Invalid channel or entity id`,
          });
        },
      )
      .put(
        `/channel/:channel/:entityId/markAllAsRead`,
        async ({
          user,
          params: { channel, entityId },
          query,
        }: {
          user: IUser;
          params: { channel: string; entityId: string };
          query: any;
        }) => {
          const service = getService(user.id);
          if (channel && entityId) {
            return await service.markAllAsRead(channel, entityId, query?.before);
          }
          return ResponseError.throw({
            status: StatusCodes.BAD_REQUEST,
            statusText: ReasonPhrases.BAD_REQUEST,
            message: `Invalid channel or entity id`,
          });
        },
      ),
  );

  BaseController<IMessage, IMessageInsert, IMessageUpdate>(app, messageRoute, getService);

  return app;
};
