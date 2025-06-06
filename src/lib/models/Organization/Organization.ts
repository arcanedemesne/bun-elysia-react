import { BaseEntity, BaseEntityDTO, IBaseEntityDTO, IBaseEntityId } from "../BaseEntity";
import { ITeam } from "../Team";
import { ITodo } from "../Todo";
import { IUser, UserDTO } from "../User";
import { IOrganization } from "./IOrganization";

export interface IOrganizationDTO extends IBaseEntityDTO {
  name: string;
  description: string;
  members: UserDTO[];
  todosCount: number;
  teamsCount: number;
}

export class OrganizationDTO extends BaseEntityDTO implements IOrganizationDTO {
  name: string;
  description: string;
  members: UserDTO[];
  todosCount: number;
  teamsCount: number;

  constructor(organization: IOrganization) {
    super(organization);

    this.name = organization.name;
    this.description = organization.description;
    this.members = organization.members.map((x) => new UserDTO(x));
    this.todosCount = organization.todos.length;
    this.teamsCount = organization.teams.length;
  }
}

export interface IOrganizationMinimalDTO extends IBaseEntityId {
  name: string;
}

export type IOrganizationMemberDTO = {
  userId: string;
  organizationId: string;
};

export class Organization extends BaseEntity implements IOrganization {
  name: string;
  description: string;
  members: IUser[];
  todos: ITodo[];
  teams: ITeam[];

  constructor(organization: IOrganization) {
    super(organization);

    this.name = organization.name;
    this.description = organization.description;
    this.members = organization.members;
    this.todos = organization.todos;
    this.teams = organization.teams;
  }

  toDTO = () => new OrganizationDTO(this);
}
