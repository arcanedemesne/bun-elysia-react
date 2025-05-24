import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps } from "../BaseEntity";
import { UserDTO } from "../User/UserDTO";

export interface TeamDTO extends BaseEntityId, BaseEntityTimeStamps, BaseEntityActive {
  organizationId: string;
  name: string;
  members: UserDTO[];
  todosCount: number;
  createdBy?: UserDTO;
  updatedBy?: UserDTO;
  deletedBy?: UserDTO;
}
