import {
  IBaseEntity,
  IBaseEntityDTO,
  IBaseEntityId,
  IBaseEntityUserAudits,
  IBaseEntityUserAuditsDTO,
} from "./IBaseEntity";

// mimic the IUserDTO so that we don't have a circular dependency
export const buildUserAuditsDTO = (
  user: any,
): IBaseEntityId & {
  username: string;
  isOnline?: boolean;
} => {
  return {
    id: user.id,
    username: user.username,
    isOnline: user.isOnline,
  };
};

export class BaseEntityDTO implements IBaseEntityDTO {
  public id: string;
  public createdBy: IBaseEntityUserAuditsDTO["createdBy"] | undefined;
  public updatedBy?: IBaseEntityUserAuditsDTO["updatedBy"];
  public deletedBy?: IBaseEntityUserAuditsDTO["deletedBy"];
  public createdAt: Date | undefined;
  public updatedAt?: Date;
  public deletedAt?: Date;
  public active: boolean;

  constructor(entity: IBaseEntity) {
    this.id = entity.id;
    this.createdBy = entity.createdBy ? buildUserAuditsDTO(entity.createdBy) : undefined;
    this.updatedBy = entity.updatedBy ? buildUserAuditsDTO(entity.updatedBy) : undefined;
    this.deletedBy = entity.deletedBy ? buildUserAuditsDTO(entity.deletedBy) : undefined;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.deletedAt = entity.deletedAt;
    this.active = entity.active;
  }
}

export class BaseEntity implements IBaseEntity {
  public id: string;
  public createdBy: IBaseEntityUserAudits["createdBy"] | undefined;
  public updatedBy?: IBaseEntityUserAudits["updatedBy"];
  public deletedBy?: IBaseEntityUserAudits["deletedBy"];
  public createdAt: Date | undefined;
  public updatedAt?: Date;
  public deletedAt?: Date;
  public active: boolean;

  constructor(entity: IBaseEntity) {
    this.id = entity.id;
    this.createdBy = entity.createdBy;
    this.updatedBy = entity.updatedBy;
    this.deletedBy = entity.deletedBy;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.deletedAt = entity.deletedAt;
    this.active = entity.active;
  }

  toBaseDTO = () => new BaseEntityDTO(this);
}
