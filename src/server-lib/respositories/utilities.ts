import { SQL, sql } from "drizzle-orm";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { ResponseError } from "@/lib/types";

export const throwDbError = (messagePrefix: string, error?: unknown) => {
  const message = `${messagePrefix} - ${error?.toString()}`;
  console.error(message);
  return ResponseError.throw({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
    message,
  });
};

type PlaceholderType = Record<string, SQL<unknown> | any>;
type ValueType = Record<string, any>;
type ReturnType = { placeholders: PlaceholderType; values: ValueType };
// Use this in raw sql`` statements
export const paramaterize = (payload: any, wrapInSql?: boolean | undefined): ReturnType => {
  const placeholders: PlaceholderType = {};
  const values: ValueType = {};

  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== undefined) {
      placeholders[key] = wrapInSql ? sql`${sql.placeholder(key)}` : sql.placeholder(key);
      values[key] = payload[key];
    }
  }
  return { placeholders, values };
};

const userDTOcolumns = {
  columns: {
    id: true,
    username: true,
  },
};

export const withRelations = {
  userAudits: {
    createdBy: true,
    updatedBy: true,
    deletedBy: true,
  },

  userAuditsDTO: {
    createdBy: userDTOcolumns,
    updatedBy: userDTOcolumns,
    deletedBy: userDTOcolumns,
  },
};

export const removePropsFromEntities = <T>(list: any[], propsToRemove: string[]) => {
  return list.map((item) => {
    const newItem = { ...item };

    propsToRemove.forEach((prop) => {
      delete newItem[prop];
    });

    return newItem as T;
  });
};
