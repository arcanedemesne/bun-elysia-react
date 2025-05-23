import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps } from "@/lib/models/BaseEntity";

export interface User extends BaseEntityId, BaseEntityTimeStamps, BaseEntityActive {
  username: string;
  email: string;
  password: string;
  isOnline: boolean;
  sessionId: string | null;
  refreshToken: string | null;
}
