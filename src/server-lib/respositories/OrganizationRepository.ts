import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  Organization,
  OrganizationDTO,
  OrganizationInsertDTO,
  OrganizationMemberDTO,
  OrganizationUpdateDTO,
  UserDTO,
} from "@/lib/models";

import { db } from "../../data/db";
import { organizations, teams, users, usersToOrganizations } from "../../data/schema";
import { IRepository } from "./IRepository";
import { throwDbError } from "./utilities";

const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");
const deletedBy = alias(users, "deletedBy");

export class OrganizationRepository
  implements IRepository<Organization, OrganizationDTO, OrganizationInsertDTO, OrganizationUpdateDTO>
{
  constructor(public userId: string) {}

  selectDTO = {
    id: organizations.id,
    name: organizations.name,
    description: organizations.description,
    createdAt: organizations.createdAt,
    updatedAt: organizations.updatedAt,
    deletedAt: organizations.deletedAt,
    createdBy: {
      id: createdBy.id,
      username: createdBy.username,
    },
    updatedBy: {
      id: updatedBy.id,
      username: updatedBy.username,
    },
    deletedBy: {
      id: deletedBy.id,
      username: deletedBy.username,
    },
    teamsCount:
      sql`(SELECT COUNT(*) FROM ${teams} WHERE ${teams.organizationId} = ${organizations.id} AND active IS true)`.as(
        "teams_count",
      ),
  };

  async getAll() {
    return throwDbError("Not implemented");
  }

  async getById(id: string): Promise<OrganizationDTO | null> {
    try {
      const data = await db
        .select(this.selectDTO)
        .from(organizations)
        .innerJoin(createdBy, eq(organizations.createdBy, createdBy.id))
        .fullJoin(updatedBy, eq(organizations.updatedBy, updatedBy.id))
        .fullJoin(deletedBy, eq(organizations.deletedBy, deletedBy.id))
        .where(and(eq(organizations.id, id), eq(organizations.active, true)));

      if (data.length === 0) {
        return null;
      }

      const response = data[0] as unknown as OrganizationDTO;

      const members = await this.getMembers(response.id);
      response.members.push(...members);

      return response;
    } catch (error) {
      return throwDbError("Error getting organization by id", error);
    }
  }

  async getByUserId(userId: string): Promise<OrganizationDTO[]> {
    try {
      const data = await db
        .select(this.selectDTO)
        .from(organizations)
        .innerJoin(createdBy, eq(organizations.createdBy, createdBy.id))
        .fullJoin(updatedBy, eq(organizations.updatedBy, updatedBy.id))
        .fullJoin(deletedBy, eq(organizations.deletedBy, deletedBy.id))
        .innerJoin(usersToOrganizations, eq(organizations.id, usersToOrganizations.organizationId))
        .where(and(eq(usersToOrganizations.userId, userId), eq(organizations.active, true)))
        .orderBy(organizations.createdAt);

      const response = data as unknown as OrganizationDTO[];
      for (let team of response) {
        if (!team.members) team.members = [];
        const members = await this.getMembers(team.id);
        team.members.push(...members);
      }

      return response;
    } catch (error) {
      return throwDbError("Error getting organizations by user id", error);
    }
  }

  async insert(insertData: OrganizationInsertDTO): Promise<Organization | null> {
    try {
      const data = await db
        .insert(organizations)
        .values({ ...insertData, createdBy: this.userId })
        .returning();

      if (data.length === 0) {
        return null;
      }

      const response = data[0] as Organization;

      await db.insert(usersToOrganizations).values({ userId: this.userId, organizationId: response.id }).returning();

      return response;
    } catch (error) {
      return throwDbError("Error inserting organization", error);
    }
  }

  async update(updateData: OrganizationUpdateDTO): Promise<Organization | null> {
    try {
      const { id, ...rest } = { ...updateData, updatedBy: this.userId };
      const data = await db.update(organizations).set(rest).where(eq(organizations.id, id)).returning();

      if (data.length === 0) {
        return null; // Update failed
      }

      return data[0] as Organization;
    } catch (error) {
      return throwDbError("Error updating organization", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await db.select().from(organizations).where(eq(organizations.id, id));
      let result;
      if (existingEntity.length > 0) {
        result = await this.update({
          id: existingEntity[0].id,
          deletedBy: existingEntity[0].deletedBy!,
          active: false,
        });
        if (result?.id) {
          return true; // soft deleted successfully
        }
      } else {
        await db.delete(usersToOrganizations).where(eq(usersToOrganizations.organizationId, id));
        result = await db.delete(organizations).where(eq(organizations.id, id));
        if (result) {
          return true; // hard deleted successfully
        }
      }

      return false; // not found
    } catch (error) {
      return throwDbError("Error deleting organization", error);
    }
  }

  async getMembers(organizationId: string): Promise<UserDTO[]> {
    try {
      const data = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(usersToOrganizations)
        .innerJoin(users, eq(usersToOrganizations.userId, users.id))
        .where(and(eq(usersToOrganizations.organizationId, organizationId), eq(users.active, true)))
        .orderBy(users.username);

      return data as UserDTO[];
    } catch (error) {
      return throwDbError("Error getting organization members", error);
    }
  }

  async addMember(member: OrganizationMemberDTO): Promise<OrganizationMemberDTO | null> {
    try {
      // TODO: check if exists and set to acive?
      const data = await db.insert(usersToOrganizations).values(member).returning();

      if (data.length === 0) {
        return null;
      }

      return data[0] as OrganizationMemberDTO;
    } catch (error) {
      return throwDbError("Error adding organization member", error);
    }
  }

  async removeMember(member: OrganizationMemberDTO): Promise<boolean> {
    try {
      const data = await db
        .delete(usersToOrganizations)
        .where(
          and(
            eq(usersToOrganizations.userId, member.userId),
            eq(usersToOrganizations.organizationId, member.organizationId),
          ),
        )
        .returning();
      if (data) {
        return true; // hard deleted successfully
      }
      return false; // unsuccessful delete
    } catch (error) {
      return throwDbError("Error removing organization member", error);
    }
  }
}
