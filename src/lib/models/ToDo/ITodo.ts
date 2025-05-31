import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUser } from "@/lib/models/BaseEntity";

import { IOrganization } from "../Organization";
import { ITeam } from "../Team";

export interface ITodo extends BaseEntityId, BaseEntityUser, BaseEntityTimeStamps, BaseEntityActive {
  title: string;
  description?: string;
  organizationId?: string;
  organization?: IOrganization;
  teamId?: string;
  team?: ITeam;
}
