import { IBaseEntity } from "@/lib/models/BaseEntity";

import { IOrganization } from "../Organization";
import { ITeam } from "../Team";
import { IUser } from "../User";

export interface IMessage extends IBaseEntity {
  message: string;
  organizationId?: string;
  organization?: IOrganization;
  teamId?: string;
  team?: ITeam;
  recipientId?: string;
  recipient?: IUser;
}
