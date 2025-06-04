import { IBaseEntity } from "../BaseEntity";
import { ITeam } from "../Team";
import { ITodo } from "../Todo";
import { IUser } from "../User";

export interface IOrganization extends IBaseEntity {
  name: string;
  description: string;
  teams: ITeam[];
  members: IUser[];
  todos: ITodo[];
}
