import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUserInfo } from "../BaseEntity";

export interface Team extends BaseEntityId, BaseEntityUserInfo, BaseEntityTimeStamps, BaseEntityActive {
  name: string;
}
