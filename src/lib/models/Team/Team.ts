import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps } from "../BaseEntity";
import { User, UserDTO } from "../User";
import { ITeam } from "./ITeam";

export interface TeamDTO extends BaseEntityId, BaseEntityTimeStamps, BaseEntityActive {
  organizationId: string;
  name: string;
  members: UserDTO[];
  todosCount: number;
  createdBy?: UserDTO;
  updatedBy?: UserDTO;
  deletedBy?: UserDTO;
}

export interface TeamSocketDTO extends BaseEntityId {
  organizationId: string;
  name: string;
}

export type TeamMemberDTO = {
  userId: string;
  teamId: string;
};

export class Team {
  constructor(public team: ITeam) {}

  toDTO = () => {
    return {
      id: this.team.id,
      organizationId: this.team.organiztionId,
      name: this.team.name,
      members: this.team.members.length > 0 ? this.team.members.map((x) => new User(x).toDTO()) : [],
      todosCount: this.team.todos.length,
      createdAt: this.team.createdAt,
      updatedAt: this.team.updatedAt,
      deletedAt: this.team.deletedAt,
      createdBy: this.team.createdBy ? new User(this.team.createdBy).toDTO() : null,
      updatedBy: this.team.updatedBy ? new User(this.team.updatedBy).toDTO() : null,
      deletedBy: this.team.deletedBy ? new User(this.team.deletedBy).toDTO() : null,
      active: this.team.active,
    } as TeamDTO;
  };
}
