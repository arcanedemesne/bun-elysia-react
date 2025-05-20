import {
  BaseEntityActive,
  BaseEntityId,
  BaseEntityUserInfo,
} from "@/lib/models/BaseEntity";

export interface TodoUpdateDTO
  extends BaseEntityId,
    BaseEntityUserInfo,
    BaseEntityActive {
  title?: string;
  description?: string;
  teamId?: string;
}
