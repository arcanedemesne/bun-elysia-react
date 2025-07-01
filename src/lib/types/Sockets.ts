import { IMessageDTO } from "../models";

export enum ChannelTypes {
  ONLINE_STATUS = "online-status",
  PUBLIC_CHAT = "public-chat",
  ORGANIZATION_CHAT = "organization-chat",
  TEAM_CHAT = "team-chat",
  PRIVATE_CHAT = "private-chat",
}

export enum SocketRequestTypes {
  PUBLISH = "publish",
  SUBSCRIBE = "subscribe",
}

export interface ISocketRequest {
  type: SocketRequestTypes;
  payload: IMessageDTO;
}
