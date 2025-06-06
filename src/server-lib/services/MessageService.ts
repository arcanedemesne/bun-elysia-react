import { IMessage, IMessageDTO, IMessageInsert, IMessageUpdate, Message } from "@/lib/models";
import { ChannelTypes } from "@/lib/types";

import { BaseService } from ".";
import { MessageRepository } from "../respositories";

export class MessageService extends BaseService<IMessage, IMessageInsert, IMessageUpdate> {
  repo: MessageRepository;

  constructor(userId: string) {
    const repo = new MessageRepository(userId);
    super(repo);
    this.repo = repo;
  }

  async getByChannel(channel: string, entityId: string): Promise<IMessageDTO[]> {
    let response: IMessageDTO[] = [];

    switch (channel) {
      case ChannelTypes.ORGANIZATION_CHAT:
        response = await this.getByOrganizationId(entityId);
        break;
      case ChannelTypes.TEAM_CHAT:
        response = await this.getByTeamId(entityId);
        break;
      case ChannelTypes.PRIVATE_CHAT:
        response = await this.getByUserId(entityId);
        break;
      case ChannelTypes.PUBLIC_CHAT:
      default:
        throw new Error(`Invalid channel ${channel}.`);
    }

    return response;
  }

  async getByUserId(userId: string, asRecipient: boolean = true): Promise<IMessageDTO[]> {
    const entities = await this.repo.getByUserId(userId, asRecipient);
    return entities.map((x) => new Message(x).toDTO());
  }

  private async getByOrganizationId(organizationId: string): Promise<IMessageDTO[]> {
    const entities = await this.repo.getByOrganizationId(organizationId);
    return entities.map((x) => new Message(x).toDTO());
  }

  private async getByTeamId(teamId: string): Promise<IMessageDTO[]> {
    const entities = await this.repo.getByTeamId(teamId);
    return entities.map((x) => new Message(x).toDTO());
  }
}
