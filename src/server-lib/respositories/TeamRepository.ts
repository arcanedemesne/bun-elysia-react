import { and, eq, exists } from "drizzle-orm";

import { ITeam, ITeamInsert, ITeamMemberDTO, ITeamUpdate } from "@/lib/models";

import { db } from "../../data/db";
import { organizations, teams, todos, usersToTeams } from "../../data/schema";
import { BaseRepository } from "./BaseRepository";
import { removePropsFromEntities, throwDbError, withRelations } from "./utilities";

const defaultWith = {
  ...withRelations.userAudits,
  usersToTeams: {
    with: {
      user: true,
    },
  },
  organization: {
    where: eq(organizations.active, true),
  },
  todos: {
    where: eq(todos.active, true),
  },
};

const transform = <T>(entities: any[]): T => {
  entities = entities.map((x) => ({
    ...x,
    members: x.usersToTeams?.map((t: any) => t.user),
  }));

  entities = removePropsFromEntities(
    entities.filter((x) => x.usersToTeams?.length > 0),
    ["usersToTeams"],
  );

  return entities as T;
};

export class TeamRepository extends BaseRepository<ITeam, ITeamInsert, ITeamUpdate> {
  constructor(userId: string) {
    super(teams, "ITeam", userId, defaultWith, transform);
  }

  async hasUser(teamId: string, userId: string): Promise<boolean> {
    const results = await db
      .select()
      .from(usersToTeams)
      .where(and(eq(usersToTeams.teamId, teamId), eq(usersToTeams.userId, userId)));
    return results.length > 0;
  }

  async getByOrganizationId(organizationId: string): Promise<ITeam[]> {
    try {
      let entities = await db.query.teams.findMany({
        with: defaultWith,
        where: and(eq(teams.organizationId, organizationId), this.clauses.active),
      });

      return transform<ITeam[]>(entities);
    } catch (error) {
      return throwDbError("Error getting teams by organization id", error);
    }
  }

  async getByUserId(userId: string): Promise<ITeam[]> {
    try {
      let entities = await db.query.teams.findMany({
        with: defaultWith,
        where: and(
          this.clauses.active,
          exists(
            db
              .select()
              .from(usersToTeams)
              .where(and(eq(usersToTeams.userId, userId))),
          ),
        ),
      });

      return transform<ITeam[]>(entities);
    } catch (error) {
      return throwDbError("Error getting teams by user id", error);
    }
  }

  async addMember(member: ITeamMemberDTO): Promise<ITeamMemberDTO | null> {
    try {
      const hasMember = await this.hasUser(member.teamId, member.userId);
      if (hasMember) {
        throw new Error("Member already exists on team");
      }

      const entities = await db.insert(usersToTeams).values(member).returning();

      if (entities.length === 0) {
        throw new Error(`Could not add member with id ${member.userId}`);
      }
      return entities[0] as ITeamMemberDTO;
    } catch (error) {
      return throwDbError("Error adding team member", error);
    }
  }

  async removeMember(member: ITeamMemberDTO): Promise<boolean> {
    try {
      const hasMember = await this.hasUser(member.teamId, member.userId);
      if (!hasMember) {
        throw new Error("Member doesn't exist on team");
      }
      const entities = await db
        .delete(usersToTeams)
        .where(and(eq(usersToTeams.userId, member.userId), eq(usersToTeams.teamId, member.teamId)))
        .returning();

      if (entities.length > 0) {
        return true;
      }

      return false; // unsuccessful delete
    } catch (error) {
      return throwDbError("Error removing team member", error);
    }
  }
}
