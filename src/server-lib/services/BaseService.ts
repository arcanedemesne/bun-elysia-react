import { IRepository } from "../respositories";
import { IBaseService } from "./IBaseService";

export class BaseService<IEntity, IInsert, IUpdate> implements IBaseService<IEntity, IInsert, IUpdate> {
  constructor(public repo: IRepository<IEntity, IInsert, IUpdate>) {}

  async getAll(): Promise<Array<IEntity>> {
    return this.repo.getAll();
  }

  async getById(id: string): Promise<IEntity | null> {
    return this.repo.getById(id);
  }

  async insert(model: IInsert): Promise<IEntity | null> {
    return this.repo.insert(model);
  }

  async update(model: IUpdate): Promise<IEntity | null> {
    return this.repo.update(model);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
