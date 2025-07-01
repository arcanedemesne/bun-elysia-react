import { relations } from "drizzle-orm";

import { todos } from "../todos";
import { users } from "../users";
import { usersToMessages } from "../usersToMessages";
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
  usersToMessages: many(usersToMessages),
  todos: many(todos),
}));
