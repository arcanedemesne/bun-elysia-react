import { BaseEntityActive, BaseEntityId, BaseEntityUserInfo } from "../BaseEntity";

export interface TeamUpdateDTO extends BaseEntityId, BaseEntityUserInfo, BaseEntityActive {
  name?: string;
}
