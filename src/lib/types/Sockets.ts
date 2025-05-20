import { UserDTO } from "../models";

export enum ChannelTypes {
  ONLINE_STATUS = "online-status",
  PUBLIC_CHAT = "public-chat",
}

export interface PublishMessagePayload {
  channel: string;
  user: UserDTO;
  createdAt?: Date;
  message?: string;
  isOnline?: boolean;
}

export enum MessageTypes {
  PUBLISH = "publish",
  SUBSCRIBE = "subscribe",
}

export interface Message {
  method: MessageTypes.PUBLISH | MessageTypes.SUBSCRIBE;
  payload: PublishMessagePayload;
}
