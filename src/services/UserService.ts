import { User, UserDTO, UserInsertDTO, UserUpdateDTO } from "@/lib/models";

import { BaseService } from ".";
import { UserRepository } from "../respositories";

export class UserService extends BaseService<
  User,
  UserDTO,
  UserInsertDTO,
  UserUpdateDTO
> {
  repo: UserRepository;

  constructor() {
    const repo = new UserRepository();
    super(repo);
    this.repo = repo;
  }

  async search(query: string): Promise<UserDTO[]> {
    return await this.repo.search(query);
  }
}
