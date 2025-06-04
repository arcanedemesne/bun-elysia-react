import { IUpdateEntity } from "../BaseEntity";

export interface IOrganizationUpdate extends IUpdateEntity {
  name?: string;
  description?: string;
}
