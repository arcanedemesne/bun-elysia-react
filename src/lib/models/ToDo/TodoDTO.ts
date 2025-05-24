import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, UserDTO } from "@/lib/models";

export interface TodoDTO extends BaseEntityId, BaseEntityTimeStamps, BaseEntityActive {
  title: string;
  description?: string;
  teamId?: string;
  createdBy?: UserDTO;
  updatedBy?: UserDTO;
  deletedBy?: UserDTO;
}
