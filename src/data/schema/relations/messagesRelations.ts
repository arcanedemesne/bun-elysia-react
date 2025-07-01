import { relations } from "drizzle-orm";

import { messages } from "../messages";
import { organizations } from "../organizations";
import { teams } from "../teams";
import { users } from "../users";
import { usersToMessages } from "../usersToMessages";

export const messagesUserAduitsRelations = relations(messages, ({ one }) => ({
  createdBy: one(users, {
    fields: [messages.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [messages.updatedById],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [messages.deletedById],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [messages.organizationId],
    references: [organizations.id],
  }),
  team: one(teams, {
    fields: [messages.teamId],
    references: [teams.id],
  }),
  usersToMessages: many(usersToMessages),
}));
