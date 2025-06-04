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
    ...trackableEntity.UserAudits,
    ...trackableEntity.TimeStamps,
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.teamId] }),
    index().on(table.teamId),
    index().on(table.userId),
    index().on(table.createdAt),
    index().on(table.createdById),
  ],
);
