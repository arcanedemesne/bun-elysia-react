import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUser } from "../BaseEntity";
import { IOrganization } from "../Organization";
import { ITodo } from "../Todo";
import { IUser } from "../User";

export interface ITeam extends BaseEntityId, BaseEntityUser, BaseEntityTimeStamps, BaseEntityActive {
  name: string;
  organiztionId: string;
  organization?: IOrganization;
  members: IUser[];
  todos: ITodo[];
}
