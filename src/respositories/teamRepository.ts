import sql from "../db";
import { z } from "zod";

import { TeamUpdate, TeamInsert, TeamDTO, UserDTO } from "../types";

const memberSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
});

const membersSchema = z.array(memberSchema);

const teamSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdBy: memberSchema,
  members: z.array(memberSchema).default([]),
});

const teamsSchema = z.array(teamSchema);

const teamInsertSchema = z.object({
  name: z.string(),
  createdBy: z.string(),
});

const teamUpdateSchema = z.object({
  name: z.string().optional(),
  createdBy: z.string(),
});

export const teamRepository = () => {
  const getMembers = async (teamId: string): Promise<UserDTO[]> => {
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

      const validatedMembers = membersSchema.parse(members);
      return validatedMembers as UserDTO[];
    } catch (error) {
      console.error("Error getting team members:", error);
      return [];
    }
  };

  return {
    async getTeams(): Promise<TeamDTO[]> {
      try {
        const teams = await sql`
          SELECT DISTINCT
            t.id, t.name,
            (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy"
          FROM teams t
            INNER JOIN users_teams ut
            ON ut."teamId" = t.id`;

        const validatedTeams = teamsSchema.parse(teams);
        const response = validatedTeams as TeamDTO[];

        for (let i = 0; i < response.length; i++) {
          const t = response[i];
          const members = await getMembers(t.id);
          t.members.push(...members);
        }

        return response;
      } catch (error) {
        console.error("Error getting teams:", error);
        return [];
      }
    },
    async getTeamById(id: string): Promise<TeamDTO | null> {
      try {
        const teams = await sql`
          SELECT DISTINCT
            t.id, t.name,
            (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy"
          FROM teams t
            INNER JOIN users_teams ut
            ON ut."teamId" = t.id
          WHERE t.id = ${id}`;

        if (teams.length === 0) {
          return null;
        }

        const validatedTeam = teamSchema.parse(teams[0]);
        const response = validatedTeam as TeamDTO;

        response.members = await getMembers(validatedTeam.id);

        return response;
      } catch (error) {
        console.error("Error getting team by id:", error);
        return null;
      }
    },
    async getTeamsByUserId(userId: string): Promise<TeamDTO[] | null> {
      try {
        const teams = await sql`
          SELECT DISTINCT
            t.id, t.name,
            (SELECT json_build_object('id', u.id, 'username', u.username)::jsonb
              FROM users u WHERE u.id = t."createdBy") AS "createdBy"
          FROM teams t
            INNER JOIN users_teams ut
            ON ut."teamId" = t.id
            WHERE ut."userId" = ${userId}`;

        if (teams.length === 0) {
          return null;
        }

        const validatedTeams = teamsSchema.parse(teams);
        const response = validatedTeams as TeamDTO[];

        for (let i = 0; i < response.length; i++) {
          const t = response[i];
          const members = await getMembers(t.id);
          t.members.push(...members);
        }

        return response;
      } catch (error) {
        console.error("Error getting team by user id:", error);
        return null;
      }
    },
    async insertTeam(teamData: TeamInsert): Promise<TeamDTO | null> {
      try {
        const validatedTeamData = teamInsertSchema.parse(teamData);

        const insertedTeams = await sql`
          INSERT INTO teams (name, "createdBy")
          VALUES (${validatedTeamData.name}, ${validatedTeamData.createdBy})
          RETURNING id, name, "createdBy"
        `;

        if (insertedTeams.length === 0) {
          return null; // Insertion failed
        }

        const team = insertedTeams[0] as TeamDTO;
        const insertedBridge = await sql`
          INSERT INTO users_teams ("userId", "teamId")
          VALUES (${validatedTeamData.createdBy}, ${team.id})
          RETURNING "userId", "teamId"
        `;

        if (insertedBridge.length === 0) {
          return null; // Bridge Insertion failed
        }

        return team; // Return the inserted team
      } catch (error) {
        console.error("Error inserting team:", error);
        return null;
      }
    },
    async updateTeam(
      id: string,
      updateData: TeamUpdate,
    ): Promise<TeamDTO | null> {
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
          RETURNING id, name, "createdBy"`;
        values.push(id); // Add the ID to the values array

        const updatedTeams = await sql.unsafe(query, values);

        if (updatedTeams.length === 0) {
          return null; // Team not found
        }

        const validatedTeam = teamSchema.parse(updatedTeams[0]);
        return validatedTeam as TeamDTO; // Return the updated team
      } catch (error) {
        console.error("Error updating team:", error);
        return null;
      }
    },
    async deleteTeam(id: string): Promise<boolean> {
      try {
        let result = await sql`DELETE FROM users_teams WHERE "teamId" = ${id}`;

        result = await sql`DELETE FROM teams WHERE id = ${id}`;
        if (result.count > 0) {
          return true; // Team deleted successfully
        }
        return false; // Team not found
      } catch (error) {
        console.error("Error deleting team:", error);
        return false;
      }
    },
  };
};
