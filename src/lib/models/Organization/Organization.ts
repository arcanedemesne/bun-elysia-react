import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps } from "../BaseEntity";
import { User, UserDTO } from "../User";
import { IOrganization } from "./IOrganization";

export interface OrganizationDTO extends BaseEntityId, BaseEntityTimeStamps, BaseEntityActive {
  name: string;
  members: UserDTO[];
  todosCount: number;
  teamsCount: number;
  createdBy?: UserDTO;
  updatedBy?: UserDTO;
  deletedBy?: UserDTO;
}

export interface OrganizationSocketDTO extends BaseEntityId {
  name: string;
}

export type OrganizationMemberDTO = {
  userId: string;
  organizationId: string;
};

export class Organization {
  constructor(public organization: IOrganization) {}

  toDTO = () => {
    return {
      id: this.organization.id,
      name: this.organization.name,
      members: this.organization.members.map((x) => new User(x).toDTO()),
      todosCount: this.organization.todos.length,
      teamsCount: this.organization.teams.length,
      createdAt: this.organization.createdAt,
      updatedAt: this.organization.updatedAt,
      deletedAt: this.organization.deletedAt,
      createdBy: this.organization.createdBy ? new User(this.organization.createdBy).toDTO() : null,
      updatedBy: this.organization.updatedBy ? new User(this.organization.updatedBy).toDTO() : null,
      deletedBy: this.organization.deletedBy ? new User(this.organization.deletedBy).toDTO() : null,
      active: this.organization.active,
    } as OrganizationDTO;
  };
}
