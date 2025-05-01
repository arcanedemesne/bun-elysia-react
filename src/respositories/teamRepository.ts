import sql from "../db";
import { z } from "zod";

import { IRepository } from "./IRepository";
import {
  TeamUpdate,
  TeamInsert,
  TeamDTO,
  UserDTO,
  TeamMemberDTO,
} from "../models";
import { throwDbError } from "./utilities";

const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
});

const usersSchema = z.array(userSchema);

const teamSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdBy: userSchema,
  createdOn: z.date(),
  todos: z.coerce.number(),
  members: z.array(userSchema).default([]),
});

const teamsSchema = z.array(teamSchema);

const teamInsertSchema = z.object({
  name: z.string(),
  createdBy: z.string(),
});

const teamUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
});

const teamMemberSchema = z.object({
  userId: z.string().uuid(),
  teamId: z.string().uuid(),
});

export class TeamRepository
  implements IRepository<TeamDTO, TeamInsert, TeamUpdate>
{
  private getMembers = async (teamId: string): Promise<UserDTO[]> => {
    try {
      const members = await sql`
        SELECT DISTINCT u.id, u.username
          FROM teams t
            INNER JOIN users_teams ut
            ON ut."teamId" = t.id
            INNER JOIN users u
            ON u.id = ut."userId"
          WHERE t.id = ${teamId}`;

      if (members.length === 0) {
        return [];
      }

      const validatedMembers = usersSchema.parse(members);
      return validatedMembers as UserDTO[];
    } catch (error) {
      return throwDbError("Error getting team members", error);
    }
  };

  async getAll(): Promise<TeamDTO[]> {
    try {
      const data = await sql`
          SELECT DISTINCT
            t.id, t.name,
            (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
            t."createdOn",
            (SELECT COUNT(td.id) FROM todos td WHERE td."teamId" = t.id) AS "todos"
          FROM teams t
            INNER JOIN users_teams ut
            ON ut."teamId" = t.id`;

      const validatedData = teamsSchema.parse(data);
      const response = validatedData as TeamDTO[];

      for (let i = 0; i < response.length; i++) {
        const t = response[i];
        const members = await this.getMembers(t.id);
        t.members.push(...members);
      }

      return response;
    } catch (error) {
      return throwDbError("Error getting teams", error);
    }
  }

  async getById(id: string): Promise<TeamDTO | null> {
    try {
      const data = await sql`
          SELECT DISTINCT
            t.id, t.name,
            (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
            t."createdOn",
            (SELECT COUNT(td.id) FROM todos td WHERE td."teamId" = t.id) AS "todos"
          FROM teams t
            INNER JOIN users_teams ut
            ON ut."teamId" = t.id
          WHERE t.id = ${id}`;

      if (data.length === 0) {
        return null;
      }

      const validatedData = teamSchema.parse(data[0]);
      const response = validatedData as TeamDTO;

      response.members = await this.getMembers(response.id);

      return response;
    } catch (error) {
      return throwDbError("Error getting team by id", error);
    }
  }

  async getTeamsByUserId(userId: string): Promise<TeamDTO[] | null> {
    try {
      const data = await sql`
          SELECT DISTINCT
            t.id, t.name,
            (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy",
            t."createdOn",
            (SELECT COUNT(td.id) FROM todos td WHERE td."teamId" = t.id) AS "todos"
          FROM teams t
            INNER JOIN users_teams ut
            ON ut."teamId" = t.id
            WHERE ut."userId" = ${userId}`;

      const validatedData = teamsSchema.parse(data);
      const response = validatedData as TeamDTO[];

      for (let i = 0; i < response.length; i++) {
        const t = response[i];
        const members = await this.getMembers(t.id);
        t.members.push(...members);
      }

      return response;
    } catch (error) {
      return throwDbError("Error getting team by user id", error);
    }
  }

  async insert(teamData: TeamInsert): Promise<TeamDTO | null> {
    try {
      const validatedData = teamInsertSchema.parse(teamData);

      const data = await sql`
          INSERT INTO teams (name, "createdBy")
          VALUES (${validatedData.name}, ${validatedData.createdBy})
          RETURNING id, name,
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
            FROM users u WHERE u.id = "createdBy") AS "createdBy",
          "createdOn",
          (SELECT COUNT(td.id) FROM todos td WHERE td."teamId" = id) AS "todos"
        `;

      if (data.length === 0) {
        return null; // Insertion failed
      }

      const validatedInsert = teamSchema.parse(data[0]);
      const insertedData = validatedInsert as TeamDTO;

      const insertedBridge = await sql`
          INSERT INTO users_teams ("userId", "teamId")
          VALUES (${validatedData.createdBy}, ${insertedData.id})
          RETURNING "userId", "teamId"
        `;

      if (insertedBridge.length === 0) {
        return null; // Bridge Insertion failed
      }

      return insertedData;
    } catch (error) {
      return throwDbError("Error inserting team", error);
    }
  }

  async update(updateData: TeamUpdate): Promise<TeamDTO | null> {
    try {
      const validatedUpdateData = teamUpdateSchema.parse(updateData);

      // Build the SET clause dynamically
      const setClauses: string[] = [];
      const values: any[] = [];
      let valueIndex = 1; // Start at 1 for parameterized queries

      if (validatedUpdateData.name !== undefined) {
        setClauses.push(`name = $${valueIndex++}`);
        values.push(validatedUpdateData.name);
      }

      if (setClauses.length === 0) {
        return null;
      }

      // Build the SQL query
      const setClauseString = setClauses.join(", ");
      const query = `
          UPDATE teams SET ${setClauseString} WHERE id = $${valueIndex}
          RETURNING id, name,
          (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
            FROM users u WHERE u.id = "createdBy") AS "createdBy",
          "createdOn",
          (SELECT COUNT(td.id) FROM todos td WHERE td."teamId" = id) AS "todos"`;
      values.push(updateData.id);

      const data = await sql.unsafe(query, values);

      if (data.length === 0) {
        return null; // Team not found
      }

      const updatedData = teamSchema.parse(data[0]);
      return updatedData as TeamDTO; // Return the updated team
    } catch (error) {
      return throwDbError("Error updating team", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      let result = await sql`DELETE FROM users_teams WHERE "teamId" = ${id}`;

      result = await sql`DELETE FROM teams WHERE id = ${id}`;
      if (result.count > 0) {
        return true; // Team deleted successfully
      }
      return false; // Team not found
    } catch (error) {
      return throwDbError("Error deleting team", error);
    }
  }

  async addMember(teamData: TeamMemberDTO): Promise<TeamMemberDTO | null> {
    try {
      const validatedData = teamMemberSchema.parse(teamData);

      const data = await sql`
          INSERT INTO users_teams ("userId", "teamId")
          VALUES (${validatedData.userId}, ${validatedData.teamId})
          RETURNING "userId", "teamId"
        `;

      if (data.length === 0) {
        return null; // Insertion failed
      }

      const validatedInsert = teamMemberSchema.parse(data[0]);
      const insertedData = validatedInsert as TeamMemberDTO;

      return insertedData;
    } catch (error) {
      return throwDbError("Error inserting team", error);
    }
  }

  async removeMember(teamData: TeamMemberDTO): Promise<boolean> {
    try {
      const validatedData = teamMemberSchema.parse(teamData);

      let result = await sql`
        DELETE FROM users_teams
        WHERE "userId" = ${validatedData.userId} AND "teamId" = ${validatedData.teamId}`;

      return result.count > 0;
    } catch (error) {
      return throwDbError("Error deleting team", error);
    }
  }
}
