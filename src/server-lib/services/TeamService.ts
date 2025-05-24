import { Team, TeamDTO, TeamInsertDTO, TeamMemberDTO, TeamUpdateDTO } from "@/lib/models";

import { BaseService } from ".";
import { TeamRepository } from "../respositories";

export class TeamService extends BaseService<Team, TeamDTO, TeamInsertDTO, TeamUpdateDTO> {
  repo: TeamRepository;

  constructor(userId: string) {
    const repo = new TeamRepository(userId);
    super(repo);
    this.repo = repo;
  }

  async getByOrganizationId(organizationId: string): Promise<TeamDTO[]> {
    return await this.repo.getByOrganizationId(organizationId);
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
