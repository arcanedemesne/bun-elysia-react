import { BaseEntity, BaseEntityDTO, IBaseEntityDTO } from "../BaseEntity";
import { IOrganization, IOrganizationMinimalDTO, OrganizationDTO } from "../Organization";
import { ITeam, ITeamMinimalDTO, TeamDTO } from "../Team";
import { IMessage } from "./IMessage";
import { IRecipient, IRecipientDTO, RecipientDTO } from "./Recipient";

export interface IMessageDTO extends IBaseEntityDTO {
  channel: string;
  message: string;
  organization?: IOrganizationMinimalDTO;
  team?: ITeamMinimalDTO;
  recipients?: IRecipientDTO[];
}

export class MessageDTO extends BaseEntityDTO implements IMessageDTO {
  channel: string;
  message: string;
  organization?: IOrganizationMinimalDTO;
  team?: ITeamMinimalDTO;
  recipients?: IRecipientDTO[];

  constructor(message: IMessage) {
    super(message);

    this.channel = message.channel;
    this.message = message.message;
    this.organization = message.organization && new OrganizationDTO(message.organization).toMinimalDTO();
    this.team =
      message.organization &&
      message.team &&
      new TeamDTO({ ...message.team, organization: message.organization! }).toMinimalDTO();
    this.recipients = message.recipients && message.recipients.map((x) => new RecipientDTO(x).toMinimalDTO());
  }
}

export class Message extends BaseEntity implements IMessage {
  channel: string;
  message: string;
  organizationId?: string;
  organization?: IOrganization | undefined;
  teamId?: string;
  team?: ITeam | undefined;
  recipients?: IRecipient[] | undefined;

  constructor(message: IMessage) {
    super(message);

    this.channel = message.channel;
    this.message = message.message;
    this.organizationId = message.organizationId;
    this.organization = message.organization;
    this.teamId = message.teamId;
    this.team = message.team;
    this.recipients = message.recipients;
  }

  toDTO = () => new MessageDTO(this);
}
