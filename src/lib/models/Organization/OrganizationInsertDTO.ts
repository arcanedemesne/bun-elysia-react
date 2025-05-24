import { BaseEntityUserInfo } from "../BaseEntity";

export interface OrganizationInsertDTO extends BaseEntityUserInfo {
  name: string;
  description?: string;
}
