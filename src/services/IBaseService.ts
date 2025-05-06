export interface IBaseService<Entity, DTO, InsertDTO, UpdateDTO> {
  getAll: () => Promise<Array<Entity | DTO>>;
  getById: (id: string) => Promise<Entity | DTO | null>;
  insert: (entity: InsertDTO) => Promise<Entity | null>;
  update: (entity: UpdateDTO) => Promise<Entity | null>;
  delete: (id: string) => Promise<boolean>;
}
