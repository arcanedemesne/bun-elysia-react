import { IMessage, IMessageDTO, IMessageInsert, IMessageUpdate, MessageDTO } from "@/lib/models";

import { BaseService } from ".";
import { MessageRepository } from "../respositories";

export class MessageService extends BaseService<IMessage, IMessageInsert, IMessageUpdate> {
  repo: MessageRepository;

  constructor(userId: string) {
    const repo = new MessageRepository(userId);
    super(repo);
    this.repo = repo;
  }

  override async insert(payload: IMessageInsert): Promise<IMessage | null> {
    const entity = await this.repo.insert(payload);
    let result = entity ? new MessageDTO(entity) : null;
    return { ...result } as IMessage;
  }

  override async update(payload: IMessageUpdate): Promise<IMessage | null> {
    let entity = await this.repo.update(payload);
    let result = entity ? new MessageDTO(entity) : null;
    return { ...result } as IMessage;
  }

  async getByChannel(channel: string, entityId: string, before?: Date): Promise<IMessageDTO[]> {
    let entities = await this.repo.getByChannel(channel, entityId, before);
    return entities.map((x) => new MessageDTO(x)) as IMessage[];
  }

  async markAllAsRead(channel: string, entityId: string, before?: Date): Promise<boolean> {
    return await this.repo.markAllAsRead(channel, entityId, before);
  }
}
