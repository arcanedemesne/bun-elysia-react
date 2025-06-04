import { BaseEntity, BaseEntityDTO, IBaseEntityId } from "@/lib/models/BaseEntity";

import { IUser } from "./IUser";

export interface IUserDTO extends IBaseEntityId {
  username: string;
  isOnline?: boolean;
  sessionId?: string | null;
}

export class UserDTO extends BaseEntityDTO implements IUserDTO {
  username: string;
  isOnline: boolean;
  sessionId?: string | null;

  constructor(user: IUser) {
    super(user);

    this.username = user.username;
    this.isOnline = user.isOnline;
    this.sessionId = user.sessionId;
  }
}

export interface IUserSocketDTO extends IBaseEntityId {
  username: string;
}

export class User extends BaseEntity implements IUser {
  username: string;
  email: string;
  password: string;
  isOnline: boolean;
  sessionId: string | null;
  refreshToken: string | null;

  constructor(public user: IUser) {
    super(user);

    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.isOnline = user.isOnline;
    this.sessionId = user.sessionId;
    this.refreshToken = user.refreshToken;
  }

  toDTO = (sessionId?: boolean): UserDTO => {
    const values = sessionId ? this : { ...this, sessionId: null };
    return new UserDTO(values);
  };
}
