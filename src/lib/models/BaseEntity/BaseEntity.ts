import { IUser, UserDTO } from "../User";

export interface BaseEntityId {
  id: string;
}

export interface BaseEntityTimeStamps {
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface BaseEntityUser {
  createdBy?: IUser;
  updatedBy?: IUser;
  deletedBy?: IUser;
}

export interface BaseEntityUserDTO {
  createdBy?: UserDTO;
  updatedBy?: UserDTO;
  deletedBy?: UserDTO;
}

export interface BaseEntityUserId {
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface BaseEntityActive {
  active: boolean;
}
