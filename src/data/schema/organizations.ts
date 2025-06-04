import { index, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { trackableEntity } from "./trackableEntity";

export const organizations = schema.table(
  "organizations",
  {
    ...trackableEntity.Identifier,
    name: varchar({ length: 255 }).unique().notNull(),
    description: varchar({ length: 255 }),
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
