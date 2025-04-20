import Elysia from "elysia";
import {
  apiPrefix,
  authPrefix,
  checkRoute,
  loginRoute,
  logoutRoute,
  refreshRoute,
  registerRoute,
} from "./constants";
import userRepository from "./respositories/userRepository";

export const deriveUser = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.derive(async ({ jwt, cookie: { accessToken }, set, request }) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Exclude static asset paths
    if (
      pathname === "/" ||
      pathname.startsWith(`/${apiPrefix}/${authPrefix}/${loginRoute}`) ||
      pathname.startsWith(`/${apiPrefix}/${authPrefix}/${registerRoute}`) ||
      pathname.startsWith(`/${apiPrefix}/${authPrefix}/${logoutRoute}`) ||
      pathname.startsWith(`/${apiPrefix}/${authPrefix}/${checkRoute}`) ||
      pathname.startsWith(`/${apiPrefix}/${authPrefix}/${refreshRoute}`) ||
      pathname.startsWith("/public/") ||
      pathname.endsWith(".css") ||
      pathname.endsWith(".js") ||
      pathname.endsWith(".ico")
    ) {
      return {}; // Skip authorization check
    }

    if (!accessToken.value) {
      // handle error for access token is not available
      set.status = 401;
      throw new Error("Access token is missing");
    }
    const jwtPayload = await jwt.verify(accessToken.value);
    if (!jwtPayload) {
      // handle error for access token is tempted or incorrect
      set.status = 403;
      throw new Error("Access token is invalid");
    }

    const userId = jwtPayload.sub;
    const user = await userRepository().getUserById(userId!);

    if (!user) {
      // handle error for user not found from the provided access token
      set.status = 403;
      throw new Error("Access token is invalid");
    }

    return {
      user,
    };
  });
};
