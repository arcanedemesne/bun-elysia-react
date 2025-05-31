import { relations } from "drizzle-orm";
import { index, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { messages } from "./messages";
import { teams } from "./teams";
import { todos } from "./todos";
import { trackableEntity } from "./trackableEntity";
import { users } from "./users";
import { usersToOrganizations } from "./usersToOrganizations";

export const organizations = schema.table(
  "organizations",
  {
    ...trackableEntity.Identifier,
    name: varchar({ length: 255 }).unique().notNull(),
    description: varchar({ length: 255 }),
    ...trackableEntity.UserInfo,
    ...trackableEntity.TimeStamps,
    ...trackableEntity.Active,
  },
  (table) => [index().on(table.name), index().on(table.active)],
);

export const organizationsCreatedByRelation = relations(organizations, ({ one }) => ({
  createdBy: one(users, {
    fields: [organizations.createdBy],
    references: [users.id],
  }),
}));

export const organizationsUpdatedByRelation = relations(organizations, ({ one }) => ({
  updatedBy: one(users, {
    fields: [organizations.updatedBy],
    references: [users.id],
  }),
}));

export const organizationsDeletedByRelation = relations(organizations, ({ one }) => ({
  deletedBy: one(users, {
    fields: [organizations.deletedBy],
    references: [users.id],
  }),
}));

export const organizationRelations = relations(organizations, ({ many }) => ({
  usersToOrganizations: many(usersToOrganizations),
  teams: many(teams),
  todos: many(todos),
  messages: many(messages),
}));
