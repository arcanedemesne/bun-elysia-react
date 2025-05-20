import { BaseEntityId } from "../BaseEntity";

export interface UserDTO extends BaseEntityId {
  username: string;
  sessionId: string | null;
}
