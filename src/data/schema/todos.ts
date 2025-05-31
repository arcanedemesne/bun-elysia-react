import { relations } from "drizzle-orm";
import { index, uuid, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { organizations } from "./organizations";
import { teams } from "./teams";
import { trackableEntity } from "./trackableEntity";
import { users } from "./users";

export const todos = schema.table(
  "todos",
  {
    ...trackableEntity.Identifier,
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }),
    organizationId: uuid().references(() => organizations.id, {
      onDelete: "cascade",
    }),
    teamId: uuid().references(() => teams.id, {
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

export const todosCreatedByRelation = relations(todos, ({ one }) => ({
  createdBy: one(users, {
    fields: [todos.createdBy],
    references: [users.id],
  }),
}));

export const todosUpdatedByRelation = relations(todos, ({ one }) => ({
  updatedBy: one(users, {
    fields: [todos.updatedBy],
    references: [users.id],
  }),
}));

export const todosDeletedByRelation = relations(todos, ({ one }) => ({
  deletedBy: one(users, {
    fields: [todos.deletedBy],
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
