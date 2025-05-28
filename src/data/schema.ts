import { relations } from "drizzle-orm";
import { boolean, index, pgSchema, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
    sessionId: uuid(),
    refreshToken: text(),
    ...trackableEntityTimeStamps,
    ...trackableEntityActive,
  },
  (table) => [index().on(table.username), index().on(table.email), index().on(table.active)],
);

export const organizations = schema.table(
  "organizations",
  {
    ...trackableEntityId,
    name: varchar({ length: 255 }).unique().notNull(),
    description: varchar({ length: 255 }),
    ...trackableEntityUserInfo,
    ...trackableEntityTimeStamps,
    ...trackableEntityActive,
  },
  (table) => [index().on(table.name), index().on(table.active)],
);

export const usersToOrganizations = schema.table(
  "users_to_organizations",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),
    ...trackableEntityUserInfo,
    ...trackableEntityTimeStamps,
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.organizationId] }),
    index().on(table.organizationId),
    index().on(table.userId),
  ],
);

export const organizationRelations = relations(organizations, ({ many }) => ({
  usersToOrganizations: many(usersToOrganizations),
  teamsToOrganization: many(teams),
}));

export const usersOrganizationsRelations = relations(usersToOrganizations, ({ one }) => ({
  user: one(users, {
    fields: [usersToOrganizations.userId],
    references: [users.id],
  }),
  team: one(organizations, {
    fields: [usersToOrganizations.organizationId],
    references: [organizations.id],
  }),
}));

export const teams = schema.table(
  "teams",
  {
    ...trackableEntityId,
    name: varchar({ length: 255 }).unique().notNull(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),
    ...trackableEntityUserInfo,
    ...trackableEntityTimeStamps,
    ...trackableEntityActive,
  },
  (table) => [index().on(table.name), index().on(table.active)],
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
  (table) => [
    primaryKey({ columns: [table.userId, table.teamId] }),
    index().on(table.teamId),
    index().on(table.userId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  usersToTeams: many(usersToTeams),
  usersToOrganizations: many(usersToOrganizations),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  usersToTeams: many(usersToTeams),
  organization: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id],
  }),
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
    organizationId: uuid().references(() => organizations.id, {
      onDelete: "cascade",
    }),
    teamId: uuid().references(() => teams.id, {
      onDelete: "cascade",
    }),
    ...trackableEntityUserInfo,
    ...trackableEntityTimeStamps,
    ...trackableEntityActive,
  },
  (table) => [
    index().on(table.organizationId),
    index().on(table.teamId),
    index().on(table.createdBy),
    index().on(table.active),
  ],
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

export const organizationTodosRelations = relations(organizations, ({ many }) => ({
  todos: many(todos),
}));

export const todosOrganizationRelation = relations(todos, ({ one }) => ({
  organization: one(organizations, {
    fields: [todos.organizationId],
    references: [organizations.id],
  }),
}));

export const messages = schema.table(
  "messages",
  {
    ...trackableEntityId,
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
    ...trackableEntityUserInfo,
    ...trackableEntityTimeStamps,
    ...trackableEntityActive,
  },
  (table) => [
    index().on(table.organizationId),
    index().on(table.teamId),
    index().on(table.createdBy),
    index().on(table.active),
  ],
);

export const usersMessagesRelations = relations(users, ({ many }) => ({
  messages: many(messages),
}));

export const messagesCreatedByRelation = relations(messages, ({ one }) => ({
  createdBy: one(users, {
    fields: [messages.createdBy],
    references: [users.id],
  }),
}));

export const teamsMessagesRelations = relations(teams, ({ many }) => ({
  messages: many(messages),
}));

export const messagesTeamsRelation = relations(messages, ({ one }) => ({
  team: one(teams, {
    fields: [messages.teamId],
    references: [teams.id],
  }),
}));

export const organizationMessagesRelations = relations(organizations, ({ many }) => ({
  messages: many(messages),
}));

export const messagesOrganizationRelation = relations(messages, ({ one }) => ({
  organization: one(organizations, {
    fields: [messages.organizationId],
    references: [organizations.id],
  }),
}));
