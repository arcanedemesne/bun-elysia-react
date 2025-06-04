import { relations } from "drizzle-orm";

import { messages } from "../messages";
import { todos } from "../todos";
import { users } from "../users";
import { usersToOrganizations } from "../usersToOrganizations";
import { usersToTeams } from "../usersToTeams";

export const usersUserAuditsRelations = relations(users, ({ one }) => ({
  createdBy: one(users, {
    fields: [users.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [users.updatedById],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [users.deletedById],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  usersToOrganizations: many(usersToOrganizations, {
    relationName: "usersToOrganizations",
  }),
  usersToTeams: many(usersToTeams),
  todos: many(todos),
  messages: many(messages),
}));
