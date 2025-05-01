export interface IRepository<T, I, U> {
  getAll: () => Promise<Array<T>>;
  getById: (id: string) => Promise<T | null>;
  insert: (entity: I) => Promise<T | null>;
  update: (entity: U) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
}
