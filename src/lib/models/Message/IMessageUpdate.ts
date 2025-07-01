import { IUpdateEntity } from "@/lib/models/BaseEntity";

export interface IMessageUpdate extends IUpdateEntity {
  message: string;
}
