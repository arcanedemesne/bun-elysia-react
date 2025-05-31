import { and, eq } from "drizzle-orm";

import { IOrganization, IOrganizationInsert, IOrganizationUpdate, OrganizationMemberDTO } from "@/lib/models";

import { db } from "../../data/db";
import { organizations, usersToOrganizations } from "../../data/schema";
import { IRepository } from "./IRepository";
import { removePropsFromEntities, throwDbError, withRelations } from "./utilities";

const clauses = { active: eq(organizations.active, true) };

const defaultWith = {
  usersToOrganizations: {
    with: {
      user: true,
    },
  },
  teams: true,
  todos: true,
  ...withRelations.user,
};

const transform = <T>(entities: any[]): T => {
  entities = entities.map((x) => ({
    ...x,
    members: x.usersToOrganizations.map((t: any) => t.user),
  }));

  entities = removePropsFromEntities(
    entities.filter((x) => x.usersToOrganizations.length > 0),
    ["usersToOrganizations"],
  );

  return entities as T;
};

export class OrganizationRepository implements IRepository<IOrganization, IOrganizationInsert, IOrganizationUpdate> {
  constructor(public userId: string) {}

  async getAll(): Promise<IOrganization[]> {
    try {
      const entities = await db.query.organizations.findMany({
        with: defaultWith,
        where: clauses.active,
      });

      return transform<IOrganization[]>(entities);
    } catch (error) {
      return throwDbError("Error getting organizations", error);
    }
  }

  async getById(id: string): Promise<IOrganization | null> {
    try {
      const entity = await db.query.organizations.findFirst({
        with: defaultWith,
        where: and(eq(organizations.id, id), clauses.active),
      });

      return transform<IOrganization[]>([entity])[0];
    } catch (error) {
      return throwDbError("Error getting organization by id", error);
    }
  }

  async insert(payload: IOrganizationInsert): Promise<IOrganization | null> {
    try {
      const insertPayload = { ...payload, createdBy: this.userId };
      const entities = await db.insert(organizations).values(insertPayload).returning();

      if (entities.length === 0) {
        throw new Error(`Could not insert organization with name ${payload.name}`);
      }
      return entities[0] as IOrganization;
    } catch (error) {
      return throwDbError("Error inserting organization", error);
    }
  }

  async update(payload: IOrganizationUpdate): Promise<IOrganization | null> {
    try {
      const updatePayload = { ...payload, updatedBy: this.userId };
      const entities = await db
        .update(organizations)
        .set(updatePayload)
        .where(eq(organizations.id, payload.id))
        .returning();

      if (entities.length === 0) {
        throw new Error(`Could not update organization with id ${payload.id}`);
      }
      return entities[0] as IOrganization;
    } catch (error) {
      return throwDbError("Error updating organization", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await this.getById(id);

      if (existingEntity) {
        const entity = await this.update({
          id,
          deletedAt: new Date(),
          deletedBy: this.userId,
          active: false,
        });
        if (!entity?.active) {
          return true; // soft deleted successfully
        }
      } else {
        const entities = await db.delete(organizations).where(eq(organizations.id, id)).returning();

        if (entities.length > 0) {
          return true; // hard deleted successfully
        }
      }

      throw new Error();
    } catch (error) {
      return throwDbError("Error deleting organization", error);
    }
  }

  async getByUserId(userId: string): Promise<IOrganization[]> {
    try {
      let entities = await db.query.organizations.findMany({
        with: {
          ...defaultWith,
          usersToOrganizations: {
            ...defaultWith.usersToOrganizations,
            where: eq(usersToOrganizations.userId, userId),
          },
        },
        where: clauses.active,
      });

      return transform<IOrganization[]>(entities);
    } catch (error) {
      return throwDbError("Error getting organizations by user id", error);
    }
  }

  async addMember(member: OrganizationMemberDTO): Promise<OrganizationMemberDTO | null> {
    try {
      const members = (await this.getById(member.organizationId))?.members ?? [];
      if (members.find((x) => x.id === member.userId)) {
        throw new Error("Member already exists on organization");
      }

      const entities = await db.insert(usersToOrganizations).values(member).returning();

      if (entities.length === 0) {
        throw new Error(`Could not add member with id ${member.userId}`);
      }
      return entities[0] as OrganizationMemberDTO;
    } catch (error) {
      return throwDbError("Error adding organization member", error);
    }
  }

  async removeMember(member: OrganizationMemberDTO): Promise<boolean> {
    try {
      const members = (await this.getById(member.organizationId))?.members ?? [];
      if (!members.find((x) => x.id === member.userId)) {
        throw new Error("Member doesn't exist on organization");
      }
      const entities = await db
        .delete(usersToOrganizations)
        .where(
          and(eq(usersToOrganizations.userId, member.userId), eq(usersToOrganizations.teamId, member.organizationId)),
        )
        .returning();

      if (entities.length > 0) {
        return true; // hard deleted successfully
      }

      return false; // unsuccessful delete
    } catch (error) {
      return throwDbError("Error removing organization member", error);
    }
  }
}
