import { IBaseEntity } from "../BaseEntity";
import { IOrganization } from "../Organization";
import { ITodo } from "../Todo";
import { IUser } from "../User";

export interface ITeam extends IBaseEntity {
  name: string;
  organizationId: string;
  organization: IOrganization;
  members: IUser[];
  todos: ITodo[];
}
