import { Elysia } from "elysia";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import {
  ACCESS_TOKEN_EXP,
  REFRESH_TOKEN_EXP,
  apiPrefix,
  authPrefix,
  checkRoute,
  loginRoute,
  logoutRoute,
  refreshRoute,
  registerRoute,
} from "@/lib/constants";
import { UserInsert, UserUpdate } from "@/lib/models";
import { JwtContext, LoginInfo, ResponseError } from "@/lib/types";

import { UserRepository } from "../respositories";

const getExpTimestamp = (secondsFromNow: number) => {
  return Math.floor(Date.now() / 1000) + secondsFromNow;
};

export const authRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  const repo = new UserRepository();

  return app.group(`/${apiPrefix}/${authPrefix}`, (group) =>
    group
      // LOGIN
      .post(
        `/${loginRoute}`,
        async ({ body, jwt, cookie: { accessToken, refreshToken }, set }) => {
          const loginInfo = JSON.parse(body as string) as LoginInfo;

          const user = await repo.getByUsername(loginInfo.username.toString());
          if (!user) {
            set.status = StatusCodes.NOT_FOUND;
            return ResponseError.throw({
              status: StatusCodes.NOT_FOUND,
              statusText: ReasonPhrases.NOT_FOUND,
              validation: "User does not exist",
            });
          }

          const verified = await Bun.password.verify(
            loginInfo.password.toString(),
            user.password.toString(),
          );
          if (verified) {
            const token = await jwt.sign({
              sub: user.id.toString(),
              exp: getExpTimestamp(ACCESS_TOKEN_EXP),
            });

            accessToken.set({
              value: token,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: ACCESS_TOKEN_EXP,
              path: "/",
            });

            const refreshJWTToken = await jwt.sign({
              sub: user.id.toString(),
              exp: getExpTimestamp(REFRESH_TOKEN_EXP),
            });
            refreshToken.set({
              value: refreshJWTToken,
              httpOnly: true,
              maxAge: REFRESH_TOKEN_EXP,
              path: "/",
            });

            const updatedUser = await repo.update({
              id: user.id,
              isOnline: true,
              refreshToken: refreshJWTToken,
            } as UserUpdate);

            if (updatedUser?.isOnline) {
              set.status = StatusCodes.OK;
              return { authorized: true };
            }
          }
          set.status = StatusCodes.UNAUTHORIZED;
          return ResponseError.throw({
            status: StatusCodes.UNAUTHORIZED,
            statusText: ReasonPhrases.UNAUTHORIZED,
            validation: "Invalid user credentials",
          });
        },
      )

      // REGISTER
      .post(
        `/${registerRoute}`,
        async ({ body, jwt, cookie: { accessToken, refreshToken }, set }) => {
          const loginInfo = JSON.parse(body as string) as LoginInfo;

          const user = await repo.getByUsername(loginInfo.username.toString());

          if (user) {
            set.status = StatusCodes.CONFLICT;
            return ResponseError.throw({
              status: StatusCodes.CONFLICT,
              statusText: ReasonPhrases.CONFLICT,
              validation: "Username already exists",
            });
          }

          const newUser = {
            username: loginInfo.username,
            password: await Bun.password.hash(loginInfo.password.toString()),

            isOnline: false,
            refreshToken: null,
          } as UserInsert;

          const insertedUser = await repo.insert(newUser);
          if (!insertedUser) {
            set.status = StatusCodes.UNPROCESSABLE_ENTITY;
            return ResponseError.throw({
              status: StatusCodes.UNPROCESSABLE_ENTITY,
              statusText: ReasonPhrases.UNPROCESSABLE_ENTITY,
              message: "Error creating user",
            });
          }

          const token = await jwt.sign({
            sub: insertedUser.id.toString(),
            exp: getExpTimestamp(ACCESS_TOKEN_EXP),
          });

          accessToken.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: ACCESS_TOKEN_EXP,
            path: "/",
          });

          const refreshJWTToken = await jwt.sign({
            sub: insertedUser.id.toString(),
            exp: getExpTimestamp(REFRESH_TOKEN_EXP),
          });
          refreshToken.set({
            value: refreshJWTToken,
            httpOnly: true,
            maxAge: REFRESH_TOKEN_EXP,
            path: "/",
          });

          const updatedUser = await repo.update({
            id: insertedUser.id,
            isOnline: true,
            refreshToken: refreshJWTToken,
          } as UserUpdate);

          if (updatedUser?.isOnline) {
            set.status = StatusCodes.OK;
            return { authorized: true };
          }
          set.status = StatusCodes.UNAUTHORIZED;
          return ResponseError.throw({
            status: StatusCodes.UNAUTHORIZED,
            statusText: ReasonPhrases.UNAUTHORIZED,
            message: "Failed to update user with token",
          });
        },
      )

      // REFRESH
      .post(
        `/${refreshRoute}`,
        async ({ cookie: { accessToken, refreshToken }, jwt, set }) => {
          if (!refreshToken.value) {
            // handle error for refresh token is not available
            set.status = StatusCodes.UNAUTHORIZED;
            return ResponseError.throw({
              status: StatusCodes.UNAUTHORIZED,
              statusText: ReasonPhrases.UNAUTHORIZED,
              message: "Refresh token is missing",
            });
          }
          // get refresh token from cookie
          const jwtPayload = await jwt.verify(refreshToken.value);
          if (!jwtPayload) {
            // handle error for refresh token is tempted or incorrect
            set.status = StatusCodes.FORBIDDEN;
            return ResponseError.throw({
              status: StatusCodes.FORBIDDEN,
              statusText: ReasonPhrases.FORBIDDEN,
              message: "Refresh token is invalid",
            });
          }

          // get user from refresh token
          const userId = jwtPayload.sub;

          // verify user exists or not
          const user = await repo.getById(userId!);

          if (!user) {
            // handle error for user not found from the provided refresh token
            set.status = StatusCodes.FORBIDDEN;
            return ResponseError.throw({
              status: StatusCodes.FORBIDDEN,
              statusText: ReasonPhrases.FORBIDDEN,
              message: "Refresh token is invalid",
            });
          }
          // create new access token
          const accessJWTToken = await jwt.sign({
            sub: user.id.toString(),
            exp: getExpTimestamp(ACCESS_TOKEN_EXP),
          });
          accessToken.set({
            value: accessJWTToken,
            httpOnly: true,
            maxAge: ACCESS_TOKEN_EXP,
            path: "/",
          });

          // create new refresh token
          const refreshJWTToken = await jwt.sign({
            sub: user.id.toString(),
            exp: getExpTimestamp(REFRESH_TOKEN_EXP),
          });
          refreshToken.set({
            value: refreshJWTToken,
            httpOnly: true,
            maxAge: REFRESH_TOKEN_EXP,
            path: "/",
          });

          const updatedUser = await repo.update({
            id: userId,
            isOnline: true,
            refreshToken: refreshJWTToken,
          } as UserUpdate);

          if (updatedUser?.isOnline) {
            set.status = StatusCodes.OK;
            return { authorized: true };
          }
          set.status = StatusCodes.UNAUTHORIZED;
          return ResponseError.throw({
            status: StatusCodes.UNAUTHORIZED,
            statusText: ReasonPhrases.UNAUTHORIZED,
            message: "Failed to update user with token",
          });
        },
      )

      // CHECK AUTH
      .get(`/${checkRoute}`, async ({ cookie: { accessToken }, jwt }) => {
        if (!accessToken) {
          return ResponseError.throw({
            status: StatusCodes.UNAUTHORIZED,
            statusText: ReasonPhrases.UNAUTHORIZED,
            message: "Auth check failed",
          });
        }

        if (!accessToken.value) {
          // handle error for access token is not available
          return ResponseError.throw({
            status: StatusCodes.UNAUTHORIZED,
            statusText: ReasonPhrases.UNAUTHORIZED,
            message: "Access token is missing",
          });
        }
        const jwtPayload = await jwt.verify(accessToken.value);
        if (!jwtPayload) {
          // handle error for access token is tempted or incorrect
          return ResponseError.throw({
            status: StatusCodes.FORBIDDEN,
            statusText: ReasonPhrases.FORBIDDEN,
            message: "Access token is invalid",
          });
        }

        const userId = jwtPayload.sub;
        const user = await repo.getById(userId!);

        if (!user || !user.isOnline) {
          // handle error for user not found from the provided access token
          return ResponseError.throw({
            status: StatusCodes.FORBIDDEN,
            statusText: ReasonPhrases.FORBIDDEN,
            message: "Access token is invalid",
          });
        }

        return { authorized: true };
      })

      // LOGOUT
      .post(
        `/${logoutRoute}`,
        async ({ cookie: { accessToken, refreshToken }, set, jwt }) => {
          const jwtPayload = await jwt.verify(accessToken.value);
          if (jwtPayload) {
            // verify user exists or not
            const user = await repo.getById(jwtPayload.sub!);
            if (user) {
              await repo.update({
                id: user.id,
                isOnline: false,
                refreshToken: null,
              } as UserUpdate);
            }
          }
          accessToken.remove();
          refreshToken.remove();
          set.status = StatusCodes.OK;
          return { message: "Logged out" };
        },
      ),
  );
};
