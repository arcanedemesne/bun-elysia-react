import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUserInfo } from "@/lib/models/BaseEntity";

export interface Todo extends BaseEntityId, BaseEntityUserInfo, BaseEntityTimeStamps, BaseEntityActive {
  title: string;
  description?: string;
  teamId?: string;
}
