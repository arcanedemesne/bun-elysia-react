import { relations } from "drizzle-orm";

import { messages } from "../messages";
import { organizations } from "../organizations";
import { teams } from "../teams";
import { todos } from "../todos";
import { users } from "../users";
import { usersToOrganizations } from "../usersToOrganizations";

export const organizationsUserAuditsRelations = relations(organizations, ({ one }) => ({
  createdBy: one(users, {
    fields: [organizations.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [organizations.updatedById],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [organizations.deletedById],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  usersToOrganizations: many(usersToOrganizations),
  teams: many(teams),
  todos: many(todos),
  messages: many(messages),
}));
