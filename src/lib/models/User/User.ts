import { BaseEntityId } from "@/lib/models/BaseEntity";

import { IUser } from "./IUser";

export interface UserDTO extends BaseEntityId {
  username: string;
  sessionId?: string | null;
}

export interface UserSocketDTO extends BaseEntityId {
  username: string;
}

export class User {
  constructor(public user: IUser) {}

  toDTO = (sessionId?: boolean) => {
    return {
      id: this.user.id,
      username: this.user.username,
      sessionId: sessionId ? this.user.sessionId : undefined,
    } as UserDTO;
  };
}
