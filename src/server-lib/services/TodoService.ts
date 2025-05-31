import { ITodo, ITodoInsert, ITodoUpdate, Todo, TodoDTO } from "@/lib/models";

import { BaseService } from ".";
import { TodoRepository } from "../respositories";

export class TodoService extends BaseService<ITodo, ITodoInsert, ITodoUpdate> {
  repo: TodoRepository;

  constructor(userId: string) {
    const repo = new TodoRepository(userId);
    super(repo);
    this.repo = repo;
  }

  async getByUserId(userId: string): Promise<TodoDTO[]> {
    const entities = await this.repo.getByUserId(userId);
    return entities.map((x) => new Todo(x).toDTO());
  }

  async getByOrganizationId(organizationId: string): Promise<TodoDTO[]> {
    const entities = await this.repo.getByOrganizationId(organizationId);
    return entities.map((x) => new Todo(x).toDTO());
  }

  async getByTeamId(teamId: string): Promise<TodoDTO[]> {
    const entities = await this.repo.getByTeamId(teamId);
    return entities.map((x) => new Todo(x).toDTO());
  }
}
