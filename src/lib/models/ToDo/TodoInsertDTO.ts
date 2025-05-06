import { BaseEntityUserInfo } from "../BaseEntity";

export interface TodoInsertDTO extends BaseEntityUserInfo {
  title: string;
  description?: string;
  teamId?: string;
}
