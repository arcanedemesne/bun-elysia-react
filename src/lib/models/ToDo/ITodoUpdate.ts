import { IUpdateEntity } from "@/lib/models/BaseEntity";

export interface ITodoUpdate extends IUpdateEntity {
  title?: string;
  description?: string;
  organizationId?: string;
  teamId?: string;
}
