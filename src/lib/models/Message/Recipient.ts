import { BaseEntityDTO } from "../BaseEntity";
import { IUser, IUserDTO, IUserMinimalDTO } from "../User";

export interface IRecipient extends IUser {
  isRead: boolean;
}

export interface IRecipientDTO extends IUserDTO {
  isRead: boolean;
}

export interface IRecipientMinimalDTO extends IUserMinimalDTO {
  isRead: boolean;
}

export class RecipientDTO extends BaseEntityDTO implements IRecipientDTO {
  username: string;
  isOnline: boolean;
  isRead: boolean;

  constructor(recipient: IRecipient) {
    super(recipient);

    this.username = recipient.username;
    this.isOnline = recipient.isOnline;
    this.isRead = recipient.isRead;
  }

  toMinimalDTO = (): IRecipientMinimalDTO => {
    return {
      id: this.id,
      username: this.username,
      isOnline: this.isOnline,
      isRead: this.isRead,
    } as IRecipientMinimalDTO;
  };
}
