import { and, eq } from "drizzle-orm";

import { ITeam, ITeamInsert, ITeamUpdate, TeamMemberDTO } from "@/lib/models";

import { db } from "../../data/db";
import { teams, usersToTeams } from "../../data/schema";
import { IRepository } from "./IRepository";
import { removePropsFromEntities, throwDbError, withRelations } from "./utilities";

const clauses = { active: eq(teams.active, true) };

const defaultWith = {
  usersToTeams: {
    with: {
      user: true,
    },
  },
  organization: true,
  todos: true,
  ...withRelations.user,
};

const transform = <T>(entities: any[]): T => {
  entities = entities.map((x) => ({
    ...x,
    members: x.usersToTeams.map((t: any) => t.user),
  }));

  entities = removePropsFromEntities(
    entities.filter((x) => x.usersToTeams.length > 0),
    ["usersToTeams"],
  );

  return entities as T;
};

export class TeamRepository implements IRepository<ITeam, ITeamInsert, ITeamUpdate> {
  constructor(public userId: string) {}
  // #region CRUD
  async getAll(): Promise<ITeam[]> {
    try {
      const entities = await db.query.teams.findMany({
        with: defaultWith,
        where: clauses.active,
      });

      return transform<ITeam[]>(entities);
    } catch (error) {
      return throwDbError("Error getting teams", error);
    }
  }

  async getById(id: string): Promise<ITeam | null> {
    try {
      const entity = await db.query.teams.findFirst({
        with: defaultWith,
        where: and(eq(teams.id, id), clauses.active),
      });

      return transform<ITeam[]>([entity])[0];
    } catch (error) {
      return throwDbError("Error getting team by id", error);
    }
  }

  async insert(payload: ITeamInsert): Promise<ITeam | null> {
    try {
      const insertPayload = { ...payload, createdBy: this.userId };
      const entities = await db.insert(teams).values(insertPayload).returning();

      if (entities.length === 0) {
        throw new Error(`Could not insert team with name ${payload.name}`);
      }
      return entities[0] as ITeam;
    } catch (error) {
      return throwDbError("Error inserting team", error);
    }
  }

  async update(payload: ITeamUpdate): Promise<ITeam | null> {
    try {
      const updatePayload = { ...payload, updatedBy: this.userId };
      const entities = await db.update(teams).set(updatePayload).where(eq(teams.id, payload.id)).returning();

      if (entities.length === 0) {
        throw new Error(`Could not update team with id ${payload.id}`);
      }
      return entities[0] as ITeam;
    } catch (error) {
      return throwDbError("Error updating team", error);
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
        const entities = await db.delete(teams).where(eq(teams.id, id)).returning();

        if (entities.length > 0) {
          return true; // hard deleted successfully
        }
      }

      throw new Error();
    } catch (error) {
      return throwDbError("Error deleting team", error);
    }
  }
  // #endregion

  async getByOrganizationId(organizationId: string): Promise<ITeam[]> {
    try {
      let entities = await db.query.teams.findMany({
        with: defaultWith,
        where: and(eq(teams.organizationId, organizationId), clauses.active),
      });

      return transform<ITeam[]>(entities);
    } catch (error) {
      return throwDbError("Error getting teams by organization id", error);
    }
  }

  async getByUserId(userId: string): Promise<ITeam[]> {
    try {
      let entities = await db.query.teams.findMany({
        with: {
          ...defaultWith,
          usersToTeams: {
            ...defaultWith.usersToTeams,
            where: eq(usersToTeams.userId, userId),
          },
        },
        where: clauses.active,
      });

      return transform<ITeam[]>(entities);
    } catch (error) {
      return throwDbError("Error getting teams by user id", error);
    }
  }

  async addMember(member: TeamMemberDTO): Promise<TeamMemberDTO | null> {
    try {
      const members = (await this.getById(member.teamId))?.members ?? [];
      if (members.find((x) => x.id === member.userId)) {
        throw new Error("Member already exists on team");
      }

      const entities = await db.insert(usersToTeams).values(member).returning();

      if (entities.length === 0) {
        throw new Error(`Could not add member with id ${member.userId}`);
      }
      return entities[0] as TeamMemberDTO;
    } catch (error) {
      return throwDbError("Error adding team member", error);
    }
  }

  async removeMember(member: TeamMemberDTO): Promise<boolean> {
    try {
      const members = (await this.getById(member.teamId))?.members ?? [];
      if (!members.find((x) => x.id === member.userId)) {
        throw new Error("Member doesn't exist on team");
      }
      const entities = await db
        .delete(usersToTeams)
        .where(and(eq(usersToTeams.userId, member.userId), eq(usersToTeams.teamId, member.teamId)))
        .returning();

      if (entities.length > 0) {
        return true; // hard deleted successfully
      }

      return false; // unsuccessful delete
    } catch (error) {
      return throwDbError("Error removing team member", error);
    }
  }
}
