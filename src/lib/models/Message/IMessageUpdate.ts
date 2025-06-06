import { IUpdateEntity } from "@/lib/models/BaseEntity";

export interface IMessageUpdate extends IUpdateEntity {
  message: string;
  channel: string;
  organizationId?: string;
  teamId?: string;
  recipientId?: string;
}
