import { BaseEntity, BaseEntityDTO, IBaseEntityDTO, IBaseEntityId } from "../BaseEntity";
import { IOrganization, IOrganizationMinimalDTO, OrganizationDTO } from "../Organization";
import { ITodo } from "../Todo";
import { IUser, IUserDTO, UserDTO } from "../User";
import { ITeam } from "./ITeam";

export interface ITeamDTO extends IBaseEntityDTO {
  organizationId: string;
  organization: IOrganizationMinimalDTO;
  name: string;
  members: IUserDTO[];
  todosCount: number;
}

export class TeamDTO extends BaseEntityDTO implements ITeamDTO {
  organizationId: string;
  organization: IOrganizationMinimalDTO;
  name: string;
  members: IUserDTO[];
  todosCount: number;

  constructor(team: ITeam) {
    super(team);

    this.organizationId = team.organizationId;
    this.organization = team.organization && new OrganizationDTO(team.organization).toMinimalDTO();
    this.name = team.name;
    this.members = team.members ? team.members.map((x) => new UserDTO(x)) : [];
    this.todosCount = team.todos ? team.todos.length : 0;
  }

  toMinimalDTO = () => {
    return {
      id: this.id,
      name: this.name,
      organizationId: this.organizationId,
    };
  };
}

export interface ITeamMinimalDTO extends IBaseEntityId {
  organizationId: string;
  name: string;
}

export type ITeamMemberDTO = {
  userId: string;
  teamId: string;
};

export class Team extends BaseEntity implements ITeam {
  organizationId: string;
  organization: IOrganization;
  name: string;
  members: IUser[];
  todos: ITodo[];

  constructor(team: ITeam) {
    super(team);

    this.organizationId = team.organizationId;
    this.organization = team.organization;
    this.name = team.name;
    this.members = team.members;
    this.todos = team.todos;
  }

  toDTO = () => new TeamDTO(this);

  toMinimalDTO = () => new TeamDTO(this).toMinimalDTO();
}
