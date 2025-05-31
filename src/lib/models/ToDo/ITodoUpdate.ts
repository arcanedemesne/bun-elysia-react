import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUserId } from "@/lib/models/BaseEntity";

export interface ITodoUpdate extends BaseEntityId, BaseEntityUserId, BaseEntityTimeStamps, BaseEntityActive {
  title?: string;
  description?: string;
  teamId?: string;
}
