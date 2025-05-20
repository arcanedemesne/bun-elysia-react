import { BaseEntityActive, BaseEntityId } from "../BaseEntity";

export interface UserUpdateDTO extends BaseEntityId, BaseEntityActive {
  username?: string;
  email?: string;
  password?: string;
  isOnline?: boolean;
  sessionId?: string | null;
  refreshToken?: string | null;
}
