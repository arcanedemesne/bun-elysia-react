import { BaseEntityActive, BaseEntityId, BaseEntityUserInfo } from "../BaseEntity";

export interface OrganizationUpdateDTO extends BaseEntityId, BaseEntityUserInfo, BaseEntityActive {
  name?: string;
  description?: string;
}
