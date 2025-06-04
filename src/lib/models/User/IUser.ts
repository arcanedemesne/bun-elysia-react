import { IBaseEntity } from "../BaseEntity";

export interface IUser extends IBaseEntity {
  username: string;
  email: string;
  password: string;
  isOnline: boolean;
  sessionId: string | null;
  refreshToken: string | null;
}
