import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUserId } from "../BaseEntity";

export interface ITeamUpdate extends BaseEntityId, BaseEntityUserId, BaseEntityTimeStamps, BaseEntityActive {
  name?: string;
}
