import { BaseEntity, BaseEntityDTO, IBaseEntityDTO, IBaseEntityId } from "../BaseEntity";
import { IOrganization } from "../Organization";
import { ITodo } from "../Todo";
import { IUser, UserDTO } from "../User";
import { ITeam } from "./ITeam";

export interface ITeamDTO extends IBaseEntityDTO {
  organizationId: string;
  name: string;
  members: UserDTO[];
  todosCount: number;
}

export class TeamDTO extends BaseEntityDTO implements ITeamDTO {
  organizationId: string;
  name: string;
  members: UserDTO[];
  todosCount: number;

  constructor(team: ITeam) {
    super(team);

    this.organizationId = team.organizationId;
    this.name = team.name;
    this.members = team.members.map((x) => new UserDTO(x));
    this.todosCount = team.todos.length;
  }
}

export interface ITeamSocketDTO extends IBaseEntityId {
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

  constructor(public team: ITeam) {
    super(team);

    this.organizationId = team.organizationId;
    this.organization = team.organization;
    this.name = team.name;
    this.members = team.members;
    this.todos = team.todos;
  }

  toDTO = () => new TeamDTO(this);
}
