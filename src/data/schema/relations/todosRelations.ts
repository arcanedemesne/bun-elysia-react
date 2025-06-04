import { relations } from "drizzle-orm";

import { organizations } from "../organizations";
import { teams } from "../teams";
import { todos } from "../todos";
import { users } from "../users";

export const todosUserAuditsRelations = relations(todos, ({ one }) => ({
  createdBy: one(users, {
    fields: [todos.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [todos.updatedById],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [todos.deletedById],
    references: [users.id],
  }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  organization: one(organizations, {
    fields: [todos.organizationId],
    references: [organizations.id],
  }),
  team: one(teams, {
    fields: [todos.teamId],
    references: [teams.id],
  }),
}));
