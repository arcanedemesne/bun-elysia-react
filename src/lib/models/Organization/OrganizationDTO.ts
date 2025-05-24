import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps } from "../BaseEntity";
import { UserDTO } from "../User/UserDTO";

export interface OrganizationDTO extends BaseEntityId, BaseEntityTimeStamps, BaseEntityActive {
  name: string;
  members: UserDTO[];
  teamsCount: number;
  createdBy?: UserDTO;
  updatedBy?: UserDTO;
  deletedBy?: UserDTO;
}
