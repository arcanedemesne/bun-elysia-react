import { ITodo, ITodoDTO, ITodoInsert, ITodoUpdate, TodoDTO } from "@/lib/models";

import { BaseService } from ".";
import { TodoRepository } from "../respositories";

export class TodoService extends BaseService<ITodo, ITodoInsert, ITodoUpdate> {
  repo: TodoRepository;

  constructor(userId: string) {
    const repo = new TodoRepository(userId);
    super(repo);
    this.repo = repo;
  }

  async getByUserId(userId: string): Promise<ITodoDTO[]> {
    const entities = await this.repo.getByUserId(userId);
    return entities.map((x) => new TodoDTO(x));
  }

  async getByOrganizationId(organizationId: string): Promise<ITodoDTO[]> {
    const entities = await this.repo.getByOrganizationId(organizationId);
    return entities.map((x) => new TodoDTO(x));
  }

  async getByTeamId(teamId: string): Promise<ITodoDTO[]> {
    const entities = await this.repo.getByTeamId(teamId);
    return entities.map((x) => new TodoDTO(x));
  }
}
