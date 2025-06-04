import { index, uuid, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { organizations } from "./organizations";
import { teams } from "./teams";
import { trackableEntity } from "./trackableEntity";

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
    ...trackableEntity.UserAudits,
    ...trackableEntity.TimeStamps,
    ...trackableEntity.Active,
  },
  (table) => [
    index().on(table.organizationId),
    index().on(table.teamId),
    index().on(table.createdAt),
    index().on(table.createdById),
    index().on(table.active),
  ],
);
