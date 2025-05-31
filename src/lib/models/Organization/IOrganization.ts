import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUser } from "../BaseEntity";
import { ITeam } from "../Team";
import { ITodo } from "../Todo";
import { IUser } from "../User";

export interface IOrganization extends BaseEntityId, BaseEntityUser, BaseEntityTimeStamps, BaseEntityActive {
  name: string;
  description: string;
  teams: ITeam[];
  members: IUser[];
  todos: ITodo[];
}
