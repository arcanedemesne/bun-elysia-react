import { BaseEntity, BaseEntityDTO, IBaseEntityDTO, IBaseEntityId } from "../BaseEntity";
import { ITeam, ITeamMinimalDTO, TeamDTO } from "../Team";
import { ITodo } from "../Todo";
import { IUser, IUserMinimalDTO, UserDTO } from "../User";
import { IOrganization } from "./IOrganization";

export interface IOrganizationDTO extends IBaseEntityDTO {
  name: string;
  description: string;
  members: IUserMinimalDTO[];
  teams: ITeamMinimalDTO[];
  todosCount: number;
}

export class OrganizationDTO extends BaseEntityDTO implements IOrganizationDTO {
  name: string;
  description: string;
  members: IUserMinimalDTO[];
  teams: ITeamMinimalDTO[];
  todosCount: number;

  constructor(organization: IOrganization) {
    super(organization);

    this.name = organization.name;
    this.description = organization.description;
    this.members = organization.members ? organization.members.map((x) => new UserDTO(x).toMinimalDTO()) : [];
    this.teams = organization.teams ? organization.teams.map((x) => new TeamDTO(x).toMinimalDTO()) : [];
    this.todosCount = organization.todos ? organization.todos.length : 0;
  }

  toMinimalDTO = () => {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
    };
  };
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

  toMinimalDTO = () => new OrganizationDTO(this).toMinimalDTO();
}
