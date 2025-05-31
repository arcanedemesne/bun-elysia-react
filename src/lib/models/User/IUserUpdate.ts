import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps } from "../BaseEntity";

export interface IUserUpdate extends BaseEntityId, BaseEntityTimeStamps, BaseEntityActive {
  username?: string;
  email?: string;
  password?: string;
  isOnline?: boolean;
  sessionId?: string | null;
  refreshToken?: string | null;
}
