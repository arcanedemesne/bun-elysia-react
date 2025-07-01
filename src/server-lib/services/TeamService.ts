import { ITeam, ITeamInsert, ITeamMemberDTO, ITeamUpdate, TeamDTO } from "@/lib/models";

import { BaseService } from ".";
import { TeamRepository } from "../respositories";

export class TeamService extends BaseService<ITeam, ITeamInsert, ITeamUpdate> {
  repo: TeamRepository;

  constructor(userId: string) {
    const repo = new TeamRepository(userId);
    super(repo);
    this.repo = repo;
  }

  async getByOrganizationId(organizationId: string): Promise<TeamDTO[]> {
    const entities = await this.repo.getByOrganizationId(organizationId);
    return entities.map((x) => new TeamDTO(x));
  }

  async getByUserId(userId: string): Promise<TeamDTO[]> {
    const entities = await this.repo.getByUserId(userId);
    return entities.map((x) => new TeamDTO(x));
  }

  async addMember(member: ITeamMemberDTO): Promise<ITeamMemberDTO | null> {
    return await this.repo.addMember(member);
  }

  async removeMember(member: ITeamMemberDTO): Promise<boolean> {
    return await this.repo.removeMember(member);
  }
}
