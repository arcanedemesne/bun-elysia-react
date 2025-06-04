import { relations } from "drizzle-orm";

import { messages } from "../messages";
import { organizations } from "../organizations";
import { teams } from "../teams";
import { todos } from "../todos";
import { users } from "../users";
import { usersToTeams } from "../usersToTeams";

export const teamsUserAuditsRelations = relations(teams, ({ one }) => ({
  createdBy: one(users, {
    fields: [teams.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [teams.updatedById],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [teams.deletedById],
    references: [users.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  usersToTeams: many(usersToTeams),
  organization: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id],
  }),
  todos: many(todos),
  messages: many(messages),
}));
