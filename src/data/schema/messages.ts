import { relations } from "drizzle-orm";
import { index, uuid, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { organizations } from "./organizations";
import { teams } from "./teams";
import { trackableEntity } from "./trackableEntity";
import { users } from "./users";

export const messages = schema.table(
  "messages",
  {
    ...trackableEntity.Identifier,
    channel: varchar({ length: 255 }).notNull(),
    message: varchar({ length: 255 }).notNull(),
    organizationId: uuid().references(() => organizations.id, {
      onDelete: "cascade",
    }),
    teamId: uuid().references(() => teams.id, {
      onDelete: "cascade",
    }),
    recipient: uuid().references(() => users.id, {
      onDelete: "cascade",
    }),
    ...trackableEntity.UserInfo,
    ...trackableEntity.TimeStamps,
    ...trackableEntity.Active,
  },
  (table) => [
    index().on(table.organizationId),
    index().on(table.teamId),
    index().on(table.createdBy),
    index().on(table.active),
  ],
);

export const messagesCreatedByRelation = relations(messages, ({ one }) => ({
  createdBy: one(users, {
    fields: [messages.createdBy],
    references: [users.id],
  }),
}));

export const messagesUpdatedByRelation = relations(messages, ({ one }) => ({
  updatedBy: one(users, {
    fields: [messages.updatedBy],
    references: [users.id],
  }),
}));

export const messagesDeletedByRelation = relations(messages, ({ one }) => ({
  deletedBy: one(users, {
    fields: [messages.deletedBy],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  organization: one(organizations, {
    fields: [messages.teamId],
    references: [organizations.id],
  }),
  team: one(teams, {
    fields: [messages.teamId],
    references: [teams.id],
  }),
}));
