import { BaseEntityUserInfo } from "../BaseEntity";

export interface TeamInsertDTO extends BaseEntityUserInfo {
  organizationId: string;
  name: string;
}
