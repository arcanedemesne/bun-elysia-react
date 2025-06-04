import { index, uuid, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { organizations } from "./organizations";
import { trackableEntity } from "./trackableEntity";

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
    ...trackableEntity.UserAudits,
    ...trackableEntity.TimeStamps,
    ...trackableEntity.Active,
  },
  (table) => [
    index().on(table.name),
    index().on(table.createdAt),
    index().on(table.createdById),
    index().on(table.active),
  ],
);
