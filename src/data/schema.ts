import { relations } from "drizzle-orm";

import {
  boolean,
  index,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const schemaName = "bun_elysia_react";
const schema = pgSchema(schemaName);

const trackableEntityId = {
  id: uuid().defaultRandom().primaryKey(),
};

const trackableEntityTimeStamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
  deletedAt: timestamp(),
};

const trackableEntityUserInfo = {
  createdBy: uuid().references(() => users.id),
  updatedBy: uuid().references(() => users.id),
  deletedBy: uuid().references(() => users.id),
};

const trackableEntityActive = {
  active: boolean().default(true),
};

export const users = schema.table(
  "users",
  {
    ...trackableEntityId,
    username: varchar({ length: 25 }).unique().notNull(),
    email: varchar({ length: 255 }).unique().notNull(),
    password: varchar({ length: 255 }).notNull(),
    isOnline: boolean().notNull().default(false),
    refreshToken: text(),
    ...trackableEntityTimeStamps,
    ...trackableEntityActive,
  },
  (table) => [index().on(table.username), index().on(table.email)],
);

export const teams = schema.table(
  "teams",
  {
    ...trackableEntityId,
    name: varchar({ length: 255 }).unique().notNull(),
    ...trackableEntityUserInfo,
    ...trackableEntityTimeStamps,
    ...trackableEntityActive,
  },
  (table) => [index().on(table.name)],
);

export const usersToTeams = schema.table(
  "users_to_teams",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    teamId: uuid()
      .notNull()
      .references(() => teams.id, {
        onDelete: "cascade",
      }),
    ...trackableEntityUserInfo,
    ...trackableEntityTimeStamps,
  },
  (table) => [primaryKey({ columns: [table.userId, table.teamId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  usersToTeams: many(usersToTeams),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  usersToTeams: many(usersToTeams),
}));

export const usersTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(users, {
    fields: [usersToTeams.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [usersToTeams.teamId],
    references: [teams.id],
  }),
}));

export const todos = schema.table(
  "todos",
  {
    ...trackableEntityId,
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }),
    teamId: uuid().references(() => teams.id, {
      onDelete: "cascade",
    }),
    ...trackableEntityUserInfo,
    ...trackableEntityTimeStamps,
    ...trackableEntityActive,
  },
  (table) => [index().on(table.teamId), index().on(table.createdBy)],
);

export const usersTodosRelations = relations(users, ({ many }) => ({
  todos: many(todos),
}));

export const todosCreatedByRelation = relations(todos, ({ one }) => ({
  createdBy: one(users, {
    fields: [todos.createdBy],
    references: [users.id],
  }),
}));

export const teamsTodosRelations = relations(teams, ({ many }) => ({
  todos: many(todos),
}));

export const todosTeamsRelation = relations(todos, ({ one }) => ({
  team: one(teams, {
    fields: [todos.teamId],
    references: [teams.id],
  }),
}));
