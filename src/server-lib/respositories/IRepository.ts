export interface IRepository<IEntity, IInsert, IUpdate> {
  getAll: () => Promise<Array<IEntity>>;
  getById: (id: string) => Promise<IEntity | null>;
  insert: (entity: IInsert) => Promise<IEntity | null>;
  update: (entity: IUpdate) => Promise<IEntity | null>;
  delete: (id: string) => Promise<boolean>;
}
