import { IUser, IUserInsert, IUserUpdate, User, UserDTO } from "@/lib/models";

import { BaseService } from ".";
import { UserRepository } from "../respositories";

export class UserService extends BaseService<IUser, IUserInsert, IUserUpdate> {
  repo: UserRepository;

  constructor() {
    const repo = new UserRepository();
    super(repo);
    this.repo = repo;
  }

  async search(organizationId: string, query: string): Promise<UserDTO[]> {
    const users = await this.repo.search(organizationId, query);
    return users.map((x) => new User(x).toDTO());
  }

  async getByTeamIds(teamIds: string[]): Promise<string[]> {
    return await this.repo.getByTeamIds(teamIds);
  }

  async getByOrganizationIds(organizationIds: string[]): Promise<string[]> {
    return await this.repo.getByOrganizationIds(organizationIds);
  }

  async getByUsername(username: string): Promise<IUser | null> {
    return await this.repo.getByUsername(username);
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return await this.repo.getByEmail(email);
  }
}
