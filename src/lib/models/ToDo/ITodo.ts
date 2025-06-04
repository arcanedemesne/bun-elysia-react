import { IBaseEntity } from "@/lib/models/BaseEntity";

import { IOrganization } from "../Organization";
import { ITeam } from "../Team";

export interface ITodo extends IBaseEntity {
  title: string;
  description?: string;
  organizationId?: string;
  organization?: IOrganization;
  teamId?: string;
  team?: ITeam;
}
