import { IOrganizationMinimalDTO, ITeamMinimalDTO, IUserDTO } from "../models";

export enum ChannelTypes {
  ONLINE_STATUS = "online-status",
  PUBLIC_CHAT = "public-chat",
  ORGANIZATION_CHAT = "organization-chat",
  TEAM_CHAT = "team-chat",
  PRIVATE_CHAT = "private-chat",
}

export interface PublishMessagePayload {
  channel: string;
  user: IUserDTO;
  organization?: IOrganizationMinimalDTO;
  team?: ITeamMinimalDTO;
  recipient: IUserDTO;
  message?: string;
  createdAt?: Date;
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
