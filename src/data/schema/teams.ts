import { relations } from "drizzle-orm";
import { index, uuid, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { messages } from "./messages";
import { organizations } from "./organizations";
import { todos } from "./todos";
import { trackableEntity } from "./trackableEntity";
import { users } from "./users";
import { usersToTeams } from "./usersToTeams";

export const teams = schema.table(
  "teams",
  {
    ...trackableEntity.Identifier,
    name: varchar({ length: 255 }).unique().notNull(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),
    ...trackableEntity.UserInfo,
    ...trackableEntity.TimeStamps,
    ...trackableEntity.Active,
  },
  (table) => [index().on(table.name), index().on(table.active)],
);

export const teamsCreatedByRelation = relations(teams, ({ one }) => ({
  createdBy: one(users, {
    fields: [teams.createdBy],
    references: [users.id],
  }),
}));

export const teamsUpdatedByRelation = relations(teams, ({ one }) => ({
  updatedBy: one(users, {
    fields: [teams.updatedBy],
    references: [users.id],
  }),
}));

export const teamsDeletedByRelation = relations(teams, ({ one }) => ({
  deletedBy: one(users, {
    fields: [teams.deletedBy],
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
