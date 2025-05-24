import { IBaseService } from ".";
import { IRepository } from "../respositories";

export class BaseService<Entity, DTO, InsertDTO, UpdateDTO> implements IBaseService<Entity, DTO, InsertDTO, UpdateDTO> {
  constructor(public repo: IRepository<Entity, DTO, InsertDTO, UpdateDTO>) {}

  async getAll(): Promise<Array<Entity | DTO>> {
    return this.repo.getAll();
  }

  async getById(id: string): Promise<Entity | DTO | null> {
    return this.repo.getById(id);
  }

  async insert(dto: InsertDTO): Promise<Entity | null> {
    return this.repo.insert(dto);
  }

  async update(dto: UpdateDTO): Promise<Entity | null> {
    return this.repo.update(dto);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
