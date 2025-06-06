export interface IBaseService<IEntity, IInsert, IUpdate> {
  entityTypeName: string;

  getAll: () => Promise<Array<IEntity>>;
  getById: (id: string) => Promise<IEntity | null>;
  insert: (payload: IInsert) => Promise<IEntity | null>;
  update: (payload: IUpdate) => Promise<IEntity | null>;
  delete: (id: string) => Promise<boolean>;
}
