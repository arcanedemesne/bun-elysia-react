import {
  IOrganization,
  IOrganizationDTO,
  IOrganizationInsert,
  IOrganizationMemberDTO,
  IOrganizationUpdate,
  Organization,
} from "@/lib/models";

import { OrganizationRepository } from "../respositories";
import { BaseService } from "./BaseService";

export class OrganizationService extends BaseService<IOrganization, IOrganizationInsert, IOrganizationUpdate> {
  repo: OrganizationRepository;

  constructor(userId: string) {
    const repo = new OrganizationRepository(userId);
    super(repo);
    this.repo = repo;
  }

  async getByUserId(userId: string): Promise<IOrganizationDTO[]> {
    const entities = await this.repo.getByUserId(userId);
    return entities.map((x) => new Organization(x).toDTO());
  }

  async addMember(member: IOrganizationMemberDTO): Promise<IOrganizationMemberDTO | null> {
    return await this.repo.addMember(member);
  }

  async removeMember(member: IOrganizationMemberDTO): Promise<boolean> {
    return await this.repo.removeMember(member);
  }
}
