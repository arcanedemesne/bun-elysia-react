import {
  IOrganization,
  IOrganizationInsert,
  IOrganizationUpdate,
  Organization,
  OrganizationDTO,
  OrganizationMemberDTO,
} from "@/lib/models";

import { BaseService } from ".";
import { OrganizationRepository } from "../respositories";

export class OrganizationService extends BaseService<IOrganization, IOrganizationInsert, IOrganizationUpdate> {
  repo: OrganizationRepository;

  constructor(userId: string) {
    const repo = new OrganizationRepository(userId);
    super(repo);
    this.repo = repo;
  }

  async getByUserId(userId: string): Promise<OrganizationDTO[]> {
    const entities = await this.repo.getByUserId(userId);
    return entities.map((x) => new Organization(x).toDTO());
  }

  async addMember(member: OrganizationMemberDTO): Promise<OrganizationMemberDTO | null> {
    return await this.repo.addMember(member);
  }

  async removeMember(member: OrganizationMemberDTO): Promise<boolean> {
    return await this.repo.removeMember(member);
  }
}
