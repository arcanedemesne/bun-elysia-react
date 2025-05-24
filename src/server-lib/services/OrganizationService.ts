import {
  Organization,
  OrganizationDTO,
  OrganizationInsertDTO,
  OrganizationMemberDTO,
  OrganizationUpdateDTO,
} from "@/lib/models";

import { BaseService } from ".";
import { OrganizationRepository } from "../respositories";

export class OrganizationService extends BaseService<
  Organization,
  OrganizationDTO,
  OrganizationInsertDTO,
  OrganizationUpdateDTO
> {
  repo: OrganizationRepository;

  constructor(userId: string) {
    const repo = new OrganizationRepository(userId);
    super(repo);
    this.repo = repo;
  }

  async getByUserId(userId: string): Promise<OrganizationDTO[]> {
    return await this.repo.getByUserId(userId);
  }

  async addMember(member: OrganizationMemberDTO): Promise<OrganizationMemberDTO | null> {
    return await this.repo.addMember(member);
  }

  async removeMember(member: OrganizationMemberDTO): Promise<boolean> {
    return await this.repo.removeMember(member);
  }
}
