import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { Team, TeamDTO, TeamInsertDTO, TeamMemberDTO, TeamUpdateDTO, UserDTO } from "@/lib/models";

import { db } from "../../data/db";
import { teams, todos, users, usersToTeams } from "../../data/schema";
import { IRepository } from "./IRepository";
import { throwDbError } from "./utilities";

const createdBy = alias(users, "createdBy");
const updatedBy = alias(users, "updatedBy");
const deletedBy = alias(users, "deletedBy");

export class TeamRepository implements IRepository<Team, TeamInsertDTO, TeamUpdateDTO> {
  constructor(public userId: string) {}

  selectDTO = {
    id: teams.id,
    organizationId: teams.organizationId,
    name: teams.name,
    createdAt: teams.createdAt,
    updatedAt: teams.updatedAt,
    deletedAt: teams.deletedAt,
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
    todosCount: sql`(SELECT COUNT(*) FROM ${todos} WHERE ${todos.teamId} = ${teams.id} AND active IS true)`.as(
      "todos_count",
    ),
  };

  async getAll() {
    return throwDbError("Not implemented");
  }

  async getById(id: string): Promise<Team | null> {
    try {
      const data = await db
        .select()
        .from(teams)
        // .innerJoin(createdBy, eq(teams.createdBy, createdBy.id))
        // .fullJoin(updatedBy, eq(teams.updatedBy, updatedBy.id))
        // .fullJoin(deletedBy, eq(teams.deletedBy, deletedBy.id))
        .where(and(eq(teams.id, id), eq(teams.active, true)));

      if (data.length === 0) {
        return null;
      }

      const response = data[0] as Team;

      // const members = await this.getMembers(response.id);
      // response.members.push(...members);

      return response;
    } catch (error) {
      return throwDbError("Error getting team by id", error);
    }
  }

  async getByOrganizationId(organizationId: string): Promise<TeamDTO[]> {
    try {
      const data = await db
        .select(this.selectDTO)
        .from(teams)
        .innerJoin(createdBy, eq(teams.createdBy, createdBy.id))
        .fullJoin(updatedBy, eq(teams.updatedBy, updatedBy.id))
        .fullJoin(deletedBy, eq(teams.deletedBy, deletedBy.id))
        .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
        .where(
          and(eq(teams.organizationId, organizationId), eq(usersToTeams.userId, this.userId), eq(teams.active, true)),
        )
        .orderBy(teams.createdAt);

      const response = data as TeamDTO[];

      for (let team of response) {
        if (!team.members) team.members = [];
        const members = await this.getMembers(team.id);
        team.members.push(...members);
      }

      return response;
    } catch (error) {
      return throwDbError("Error getting teams by organization id", error);
    }
  }

  async getByUserId(userId: string): Promise<TeamDTO[]> {
    try {
      const data = await db
        .select(this.selectDTO)
        .from(teams)
        .innerJoin(createdBy, eq(teams.createdBy, createdBy.id))
        .fullJoin(updatedBy, eq(teams.updatedBy, updatedBy.id))
        .fullJoin(deletedBy, eq(teams.deletedBy, deletedBy.id))
        .innerJoin(usersToTeams, eq(teams.id, usersToTeams.teamId))
        .where(and(eq(usersToTeams.userId, userId), eq(teams.active, true)))
        .orderBy(teams.createdAt);

      const response = data as TeamDTO[];
      for (let team of response) {
        if (!team.members) team.members = [];
        const members = await this.getMembers(team.id);
        team.members.push(...members);
      }

      return response;
    } catch (error) {
      return throwDbError("Error getting teams by user id", error);
    }
  }

  async insert(insertData: TeamInsertDTO): Promise<Team | null> {
    try {
      const data = await db
        .insert(teams)
        .values({ ...insertData, createdBy: this.userId })
        .returning();

      if (data.length === 0) {
        return null;
      }

      const response = data[0] as Team;

      await db.insert(usersToTeams).values({ userId: this.userId, teamId: response.id }).returning();

      return response;
    } catch (error) {
      return throwDbError("Error inserting team", error);
    }
  }

  async update(updateData: TeamUpdateDTO): Promise<Team | null> {
    try {
      const { id, ...rest } = { ...updateData, updatedBy: this.userId };
      const data = await db.update(teams).set(rest).where(eq(teams.id, id)).returning();

      if (data.length === 0) {
        return null; // Update failed
      }

      return data[0] as Team;
    } catch (error) {
      return throwDbError("Error updating team", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingEntity = await db.select().from(teams).where(eq(teams.id, id));
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
        await db.delete(usersToTeams).where(eq(usersToTeams.teamId, id));
        result = await db.delete(teams).where(eq(teams.id, id));
        if (result) {
          return true; // hard deleted successfully
        }
      }

      return false; // not found
    } catch (error) {
      return throwDbError("Error deleting team", error);
    }
  }

  async getMembers(teamId: string): Promise<UserDTO[]> {
    try {
      const data = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(usersToTeams)
        .innerJoin(users, eq(usersToTeams.userId, users.id))
        .where(and(eq(usersToTeams.teamId, teamId), eq(users.active, true)))
        .orderBy(users.username);

      return data as UserDTO[];
    } catch (error) {
      return throwDbError("Error getting team members", error);
    }
  }

  async addMember(member: TeamMemberDTO): Promise<TeamMemberDTO | null> {
    try {
      // TODO: check if exists and set to acive?
      const data = await db.insert(usersToTeams).values(member).returning();

      if (data.length === 0) {
        return null;
      }

      return data[0] as TeamMemberDTO;
    } catch (error) {
      return throwDbError("Error adding team member", error);
    }
  }

  async removeMember(member: TeamMemberDTO): Promise<boolean> {
    try {
      const data = await db
        .delete(usersToTeams)
        .where(and(eq(usersToTeams.userId, member.userId), eq(usersToTeams.teamId, member.teamId)))
        .returning();
      if (data) {
        return true; // hard deleted successfully
      }
      return false; // unsuccessful delete
    } catch (error) {
      return throwDbError("Error removing team member", error);
    }
  }
}
