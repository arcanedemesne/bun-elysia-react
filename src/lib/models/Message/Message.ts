import { BaseEntity, BaseEntityDTO, IBaseEntityDTO } from "../BaseEntity";
import { IOrganization } from "../Organization";
import { ITeam } from "../Team";
import { IUser } from "../User";
import { IMessage } from "./IMessage";

export interface IMessageDTO extends IBaseEntityDTO {
  message: string;
  organizationId?: string;
  teamId?: string;
  recipientId?: string;
}

export class MessageDTO extends BaseEntityDTO implements IMessageDTO {
  message: string;
  organizationId?: string;
  teamId?: string;
  recipientId?: string;

  constructor(message: IMessage) {
    super(message);

    this.message = message.message;
    this.organizationId = message.organizationId;
    this.teamId = message.teamId;
    this.recipientId = message.recipientId;
  }
}

export class Message extends BaseEntity implements IMessage {
  message: string;
  organizationId?: string;
  organization?: IOrganization | undefined;
  teamId?: string;
  team?: ITeam | undefined;
  recipientId?: string;
  recipient?: IUser | undefined;

  constructor(message: IMessage) {
    super(message);

    this.message = message.message;
    this.organizationId = message.organizationId;
    this.organization = message.organization;
    this.teamId = message.teamId;
    this.team = message.team;
    this.recipientId = message.recipientId;
    this.recipient = message.recipient;
  }

  toDTO = () => new MessageDTO(this);
}
