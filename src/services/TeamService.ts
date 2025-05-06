import {
  Team,
  TeamDTO,
  TeamInsertDTO,
  TeamMemberDTO,
  TeamUpdateDTO,
  User,
} from "@/lib/models";

import { BaseService } from ".";
import { TeamRepository } from "../respositories";

export class TeamService extends BaseService<
  Team,
  TeamDTO,
  TeamInsertDTO,
  TeamUpdateDTO
> {
  repo: TeamRepository;

  constructor(user: User) {
    const repo = new TeamRepository(user);
    super(repo);
    this.repo = repo;
  }

  async getByUserId(userId: string): Promise<TeamDTO[]> {
    return await this.repo.getByUserId(userId);
  }

  async addMember(member: TeamMemberDTO): Promise<TeamMemberDTO | null> {
    return await this.repo.addMember(member);
  }

  async removeMember(member: TeamMemberDTO): Promise<boolean> {
    return await this.repo.removeMember(member);
  }
}
