import sql from "../db";
import { z } from "zod";

import { Team } from "../types/Team/Team";
import { TeamUpdate } from "../types/Team/TeamUpdate";
import { TeamInsert } from "../types/Team/TeamInsert";

const teamSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdBy: z.string(),
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

const teamRepository = () => {
  return {
    async getTeams(): Promise<Team[]> {
      try {
        const teams = await sql`
          SELECT id, name, "createdBy"
          FROM teams`;

        const validatedTeams = teamsSchema.parse(teams);
        return validatedTeams as Team[];
      } catch (error) {
        console.error("Error getting teams:", error);
        return [];
      }
    },
    async getTeamById(id: string): Promise<Team | null> {
      try {
        const teams = await sql`
          SELECT id, name, "createdBy"
          FROM teams WHERE id = ${id}`;

        if (teams.length === 0) {
          return null;
        }

        const validatedTeam = teamSchema.parse(teams[0]);
        return validatedTeam as Team;
      } catch (error) {
        console.error("Error getting team by id:", error);
        return null;
      }
    },
    async getTeamsByUserId(userId: string): Promise<Team[] | null> {
      try {
        const teams = await sql`
          SELECT id, name, "createdBy"
          FROM teams t
          INNER JOIN users_teams ut
          ON t.id == ut."teamId"
          WHERE "userId" = ${userId}}`;

        if (teams.length === 0) {
          return null;
        }

        const validatedTeams = teamsSchema.parse(teams);
        return validatedTeams as Team[];
      } catch (error) {
        console.error("Error getting team by teamname:", error);
        return null;
      }
    },
    async insertTeam(teamData: TeamInsert): Promise<Team | null> {
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

        const team = insertedTeams[0] as Team
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
    async updateTeam(id: string, updateData: TeamUpdate): Promise<Team | null> {
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
        return validatedTeam as Team; // Return the updated team
      } catch (error) {
        console.error("Error updating team:", error);
        return null;
      }
    },
    async deleteTeam(id: string): Promise<boolean> {
      try {
        let  result = await sql`DELETE FROM users_teams WHERE "teamId" = ${id}`;

        // Check if any rows were deleted
        if (result.count > 0) {
          result = await sql`DELETE FROM teams WHERE id = ${id}`;
          if (result.count > 0) {
            return true; // Team deleted successfully
          }
        }
        return false; // Team not found
      } catch (error) {
        console.error("Error deleting team:", error);
        return false;
      }
    },
  };
};

export default teamRepository;
