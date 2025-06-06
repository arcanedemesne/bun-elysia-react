import { and, eq, exists } from "drizzle-orm";

import { IOrganization, IOrganizationInsert, IOrganizationMemberDTO, IOrganizationUpdate } from "@/lib/models";

import { db } from "../../data/db";
import { organizations, teams, todos, usersToOrganizations } from "../../data/schema";
import { BaseRepository } from "./BaseRepository";
import { removePropsFromEntities, throwDbError, withRelations } from "./utilities";

const defaultWith = {
  ...withRelations.userAudits,
  usersToOrganizations: {
    with: {
      user: true,
    },
  },
  teams: {
    where: eq(teams.active, true),
  },
  todos: {
    where: eq(todos.active, true),
  },
};

const transform = <T>(entities: any[]): T => {
  entities = entities.map((x) => ({
    ...x,
    members: x.usersToOrganizations?.map((t: any) => t.user),
  }));

  entities = removePropsFromEntities(
    entities.filter((x) => x.usersToOrganizations?.length > 0),
    ["usersToOrganizations"],
  );

  return entities as T;
};

export class OrganizationRepository extends BaseRepository<IOrganization, IOrganizationInsert, IOrganizationUpdate> {
  constructor(userId: string) {
    super(organizations, "Organization", userId, defaultWith, transform);
  }

  async hasUser(organizationId: string, userId: string): Promise<boolean> {
    const results = await db
      .select()
      .from(usersToOrganizations)
      .where(and(eq(usersToOrganizations.organizationId, organizationId), eq(usersToOrganizations.userId, userId)));
    return results.length > 0;
  }

  async getByUserId(userId: string): Promise<IOrganization[]> {
    try {
      let entities = await db.query.organizations.findMany({
        with: defaultWith,
        where: and(
          this.clauses.active,
          exists(db.select().from(usersToOrganizations).where(eq(usersToOrganizations.userId, userId))),
        ),
      });

      return transform<IOrganization[]>(entities);
    } catch (error) {
      return throwDbError("Error getting organizations by user id", error);
    }
  }

  async addMember(member: IOrganizationMemberDTO): Promise<IOrganizationMemberDTO | null> {
    try {
      const hasMember = await this.hasUser(member.organizationId, member.userId);
      if (hasMember) {
        throw new Error("Member already exists on organization");
      }

      const entities = await db.insert(usersToOrganizations).values(member).returning();

      if (entities.length === 0) {
        throw new Error(`Could not add member with id ${member.userId}`);
      }
      return entities[0] as IOrganizationMemberDTO;
    } catch (error) {
      return throwDbError("Error adding organization member", error);
    }
  }

  async removeMember(member: IOrganizationMemberDTO): Promise<boolean> {
    try {
      const hasMember = await this.hasUser(member.organizationId, member.userId);
      if (!hasMember) {
        throw new Error("Member doesn't exist on organization");
      }

      const entities = await db
        .delete(usersToOrganizations)
        .where(
          and(
            eq(usersToOrganizations.organizationId, member.organizationId),
            eq(usersToOrganizations.userId, member.userId),
          ),
        )
        .returning();

      if (entities.length > 0) {
        return true;
      }

      return false; // unsuccessful delete
    } catch (error) {
      return throwDbError("Error removing organization member", error);
    }
  }
}
