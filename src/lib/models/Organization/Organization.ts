import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUserInfo } from "../BaseEntity";

export interface Organization extends BaseEntityId, BaseEntityUserInfo, BaseEntityTimeStamps, BaseEntityActive {
  name: string;
  description: string;
}
