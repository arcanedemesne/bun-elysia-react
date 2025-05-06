export interface BaseEntityId {
  id: string;
}

export interface BaseEntityTimeStamps {
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface BaseEntityUserInfo {
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface BaseEntityActive {
  active: boolean;
}
