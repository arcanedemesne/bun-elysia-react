import Elysia from "elysia";

import { UserRepository } from "@/server-lib/respositories";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { apiPrefix, authPrefix } from "@/lib/constants";
import { JwtContext, ResponseError } from "@/lib/types";

export const deriveUser = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.derive(async ({ jwt, cookie: { accessToken }, set, request }) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Exclude static asset paths
    if (
      pathname === "/" ||
      pathname.startsWith(`/${apiPrefix}/${authPrefix}`) ||
      pathname.startsWith("/public/") ||
      pathname.endsWith(".css") ||
      pathname.endsWith(".js") ||
      pathname.endsWith(".ico")
    ) {
      return {}; // Skip authorization check
    }

    if (!accessToken.value) {
      // handle error for access token is not available
      set.status = StatusCodes.UNAUTHORIZED;
      return ResponseError.throw({
        status: StatusCodes.UNAUTHORIZED,
        statusText: ReasonPhrases.UNAUTHORIZED,
        message: "Access token is missing",
      });
    }
    const jwtPayload = await jwt.verify(accessToken.value);
    if (!jwtPayload) {
      // handle error for access token is tempted or incorrect
      set.status = StatusCodes.FORBIDDEN;
      return ResponseError.throw({
        status: StatusCodes.FORBIDDEN,
        statusText: ReasonPhrases.FORBIDDEN,
        message: "Access token is invalid",
      });
    }

    const userId = jwtPayload.sub;
    const user = await new UserRepository().getById(userId!);

    if (!user) {
      // handle error for user not found from the provided access token
      set.status = StatusCodes.FORBIDDEN;
      return ResponseError.throw({
        status: StatusCodes.FORBIDDEN,
        statusText: ReasonPhrases.FORBIDDEN,
        message: "Access token is invalid",
      });
    }

    return {
      user,
    };
  });
};
