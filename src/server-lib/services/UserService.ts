import { IUser, IUserInsert, IUserUpdate, User, UserDTO } from "@/lib/models";

import { UserRepository } from "../respositories";
import { BaseService } from "../services/BaseService";

export class UserService extends BaseService<IUser, IUserInsert, IUserUpdate> {
  userRepo: UserRepository;

  constructor(userId?: string) {
    const userRepo = new UserRepository(userId);
    super(userRepo);
    this.userRepo = userRepo;
  }

  async search({ searchQuery, organizationId }: { searchQuery: string; organizationId?: string }): Promise<UserDTO[]> {
    const users = await this.userRepo.search({ searchQuery, organizationId });
    return users.map((x) => new User(x).toDTO());
  }

  async getByUsername(username: string): Promise<IUser | null> {
    return await this.userRepo.getByProperty("username", username);
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return await this.userRepo.getByProperty("email", email);
  }

  async getByTeamIds(teamIds: string[]): Promise<string[]> {
    return await this.userRepo.getByTeamIds(teamIds);
  }

  async getByOrganizationIds(organizationIds: string[]): Promise<string[]> {
    return await this.userRepo.getByOrganizationIds(organizationIds);
  }
}
