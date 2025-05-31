import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUserId } from "../BaseEntity";

export interface IOrganizationUpdate extends BaseEntityId, BaseEntityUserId, BaseEntityTimeStamps, BaseEntityActive {
  name?: string;
  description?: string;
}
