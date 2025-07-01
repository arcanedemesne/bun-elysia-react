import { IBaseRepository } from "../respositories";
import { IBaseService } from "./IBaseService";

export class BaseService<IEntity, IInsert, IUpdate> implements IBaseService<IEntity, IInsert, IUpdate> {
  public entityTypeName: string;

  constructor(private baseRepo: IBaseRepository<IEntity, IInsert, IUpdate>) {
    this.entityTypeName = baseRepo.entityTypeName;
  }

  async getAll(): Promise<Array<IEntity>> {
    return await this.baseRepo.getAll();
  }

  async getById(id: string): Promise<IEntity | null> {
    return await this.baseRepo.getById(id);
  }

  async insert(payload: IInsert): Promise<IEntity | null> {
    return await this.baseRepo.insert(payload);
  }

  async update(payload: IUpdate): Promise<IEntity | null> {
    return await this.baseRepo.update(payload);
  }

  async delete(id: string): Promise<boolean> {
    return await this.baseRepo.delete(id);
  }
}
