import { User, UserDTO, UserInsertDTO, UserUpdateDTO } from "@/lib/models";

import { BaseService } from ".";
import { UserRepository } from "../respositories";

export class UserService extends BaseService<User, UserDTO, UserInsertDTO, UserUpdateDTO> {
  repo: UserRepository;

  constructor() {
    const repo = new UserRepository();
    super(repo);
    this.repo = repo;
  }

  async search(query: string): Promise<UserDTO[]> {
    return await this.repo.search(query);
  }

  async getByTeamIds(teamIds: string[]): Promise<UserDTO[]> {
    return await this.repo.getByTeamIds(teamIds);
  }

  async getByOrganizationIds(organizationIds: string[]): Promise<UserDTO[]> {
    return await this.repo.getByOrganizationIds(organizationIds);
  }

  async getByUsername(username: string): Promise<User | null> {
    return await this.repo.getByUsername(username);
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.repo.getByEmail(email);
  }
}
