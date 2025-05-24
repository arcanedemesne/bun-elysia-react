import { BaseEntityId } from "../BaseEntity";

export interface TeamSocketDTO extends BaseEntityId {
  organizationId: string;
  name: string;
}
