import { IUpdateEntity } from "../BaseEntity";

export interface IUserUpdate extends IUpdateEntity {
  username?: string;
  email?: string;
  password?: string;
  isOnline?: boolean;
  sessionId?: string | null;
  refreshToken?: string | null;
}
