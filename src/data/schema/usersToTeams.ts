import { relations } from "drizzle-orm";
import { index, primaryKey, uuid } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { teams } from "./teams";
import { trackableEntity } from "./trackableEntity";
import { users } from "./users";

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
    ...trackableEntity.UserInfo,
    ...trackableEntity.TimeStamps,
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.teamId] }),
    index().on(table.teamId),
    index().on(table.userId),
  ],
);

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(users, {
    fields: [usersToTeams.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [usersToTeams.teamId],
    references: [teams.id],
  }),
}));
