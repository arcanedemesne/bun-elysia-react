import { relations } from "drizzle-orm";
import { boolean, index, text, uuid, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { messages } from "./messages";
import { todos } from "./todos";
import { trackableEntity } from "./trackableEntity";
import { usersToOrganizations } from "./usersToOrganizations";
import { usersToTeams } from "./usersToTeams";

export const users = schema.table(
  "users",
  {
    ...trackableEntity.Identifier,
    username: varchar({ length: 25 }).unique().notNull(),
    email: varchar({ length: 255 }).unique().notNull(),
    password: varchar({ length: 255 }).notNull(),
    isOnline: boolean().notNull().default(false),
    sessionId: uuid(),
    refreshToken: text(),
    ...trackableEntity.TimeStamps,
    ...trackableEntity.Active,
  },
  (table) => [index().on(table.username), index().on(table.email), index().on(table.active)],
);

export const usersRelations = relations(users, ({ many }) => ({
  usersToOrganizations: many(usersToOrganizations),
  usersToTeams: many(usersToTeams),
  todos: many(todos),
  messages: many(messages),
}));
