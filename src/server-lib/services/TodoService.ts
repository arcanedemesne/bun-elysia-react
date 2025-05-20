import {
  Todo,
  TodoDTO,
  TodoInsertDTO,
  TodoUpdateDTO,
  User,
} from "@/lib/models";

import { BaseService } from ".";
import { TodoRepository } from "../respositories";

export class TodoService extends BaseService<
  Todo,
  TodoDTO,
  TodoInsertDTO,
  TodoUpdateDTO
> {
  repo: TodoRepository;

  constructor(user: User) {
    const repo = new TodoRepository(user);
    super(repo);
    this.repo = repo;
  }

  async getByUserId(userId: string): Promise<any[]> {
    return await this.repo.getByUserId(userId);
  }

  async getByTeamId(teamId: string): Promise<any[]> {
    return await this.repo.getByTeamId(teamId);
  }
}
