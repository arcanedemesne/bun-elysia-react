import { index, uuid, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { organizations } from "./organizations";
import { teams } from "./teams";
import { trackableEntity } from "./trackableEntity";

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
    ...trackableEntity.UserAudits,
    ...trackableEntity.TimeStamps,
    ...trackableEntity.Active,
  },
  (table) => [
    index().on(table.createdAt),
    index().on(table.organizationId),
    index().on(table.teamId),
    index().on(table.createdById),
    index().on(table.active),
  ],
);
