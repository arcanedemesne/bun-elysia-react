import { IUser, IUserDTO } from "../User";

export interface IBaseEntityId {
  id: string;
}

export interface IBaseEntityTimeStamps {
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IBaseEntityUserIdAudits {
  createdById?: string;
  updatedById?: string;
  deletedById?: string;
}

export interface IBaseEntityUserAudits {
  createdBy?: IUser;
  updatedBy?: IUser;
  deletedBy?: IUser;
}

export interface IBaseEntityUserAuditsDTO {
  createdBy?: IUserDTO;
  updatedBy?: IUserDTO;
  deletedBy?: IUserDTO;
}

export interface IBaseEntityActive {
  active: boolean;
}

export interface IBaseEntityDTO
  extends IBaseEntityId,
    IBaseEntityUserAuditsDTO,
    IBaseEntityTimeStamps,
    IBaseEntityActive {}

export interface IUpdateEntity
  extends IBaseEntityId,
    IBaseEntityUserIdAudits,
    IBaseEntityTimeStamps,
    IBaseEntityActive {}

export interface IBaseEntity extends IBaseEntityId, IBaseEntityUserAudits, IBaseEntityTimeStamps, IBaseEntityActive {}
