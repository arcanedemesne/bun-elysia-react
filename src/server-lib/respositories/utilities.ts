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
