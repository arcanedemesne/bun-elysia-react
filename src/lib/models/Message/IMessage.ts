import { IBaseEntity } from "@/lib/models/BaseEntity";

import { IOrganization } from "../Organization";
import { ITeam } from "../Team";
import { IRecipient } from "./Recipient";

export interface IMessage extends IBaseEntity {
  channel: string;
  message: string;
  organizationId?: string;
  organization?: IOrganization;
  teamId?: string;
  team?: ITeam;
  recipients?: IRecipient[];
}
