import { relations } from "drizzle-orm";

import { teams } from "../teams";
import { users } from "../users";
import { usersToTeams } from "../usersToTeams";

export const usersToTeamsUserAuditsRelations = relations(usersToTeams, ({ one }) => ({
  createdBy: one(users, {
    fields: [usersToTeams.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [usersToTeams.updatedById],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [usersToTeams.deletedById],
    references: [users.id],
  }),
}));

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(users, {
    fields: [usersToTeams.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [usersToTeams.teamId],
    references: [teams.id],
  }),
}));
