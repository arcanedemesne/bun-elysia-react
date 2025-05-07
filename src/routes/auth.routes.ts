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
import { User, UserInsertDTO, UserUpdateDTO } from "@/lib/models";
import {
  JwtContext,
  LoginRequest,
  RegisterRequest,
  ResponseError,
} from "@/lib/types";

import { UserService } from "../services";

const getExpTimestamp = (secondsFromNow: number) => {
  return Math.floor(Date.now() / 1000) + secondsFromNow;
};

export const authRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  return app.group(`/${apiPrefix}/${authPrefix}`, (group) =>
    group
      // LOGIN
      .post(
        `/${loginRoute}`,
        async ({ body, jwt, cookie: { accessToken, refreshToken }, set }) => {
          const loginInfo = JSON.parse(body as string) as LoginRequest;
          const service = new UserService();

          const user = await service.getByUsername(loginInfo.username);
          if (!user) {
            set.status = StatusCodes.NOT_FOUND;
            return ResponseError.throw({
              status: StatusCodes.NOT_FOUND,
              statusText: ReasonPhrases.NOT_FOUND,
              validation: "User does not exist",
            });
          }

          const verified = await Bun.password.verify(
            loginInfo.password,
            user.password,
          );
          if (verified) {
            const token = await jwt.sign({
              sub: user.id,
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
              sub: user.id,
              exp: getExpTimestamp(REFRESH_TOKEN_EXP),
            });
            refreshToken.set({
              value: refreshJWTToken,
              httpOnly: true,
              maxAge: REFRESH_TOKEN_EXP,
              path: "/",
            });

            const updatedUser = await service.update({
              id: user.id,
              isOnline: true,
              refreshToken: refreshJWTToken,
            } as UserUpdateDTO);

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
          const registerInfo = JSON.parse(body as string) as RegisterRequest;
          const service = new UserService();

          let user = await service.getByUsername(registerInfo.username);

          if (user) {
            set.status = StatusCodes.CONFLICT;
            return ResponseError.throw({
              status: StatusCodes.CONFLICT,
              statusText: ReasonPhrases.CONFLICT,
              validation: "Username already exists",
            });
          }

          user = await service.getByEmail(registerInfo.email);

          if (user) {
            set.status = StatusCodes.CONFLICT;
            return ResponseError.throw({
              status: StatusCodes.CONFLICT,
              statusText: ReasonPhrases.CONFLICT,
              validation: "Email already exists",
            });
          }

          const newUser = {
            username: registerInfo.username,
            email: registerInfo.email,
            password: await Bun.password.hash(registerInfo.password),

            isOnline: false,
            refreshToken: null,
          } as UserInsertDTO;

          const insertedUser = await service.insert(newUser);
          if (!insertedUser) {
            set.status = StatusCodes.UNPROCESSABLE_ENTITY;
            return ResponseError.throw({
              status: StatusCodes.UNPROCESSABLE_ENTITY,
              statusText: ReasonPhrases.UNPROCESSABLE_ENTITY,
              message: "Error creating user",
            });
          }

          const token = await jwt.sign({
            sub: insertedUser.id,
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
            sub: insertedUser.id,
            exp: getExpTimestamp(REFRESH_TOKEN_EXP),
          });
          refreshToken.set({
            value: refreshJWTToken,
            httpOnly: true,
            maxAge: REFRESH_TOKEN_EXP,
            path: "/",
          });

          const updatedUser = await service.update({
            id: insertedUser.id,
            isOnline: true,
            refreshToken: refreshJWTToken,
          } as UserUpdateDTO);

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
          const service = new UserService();
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
          const user = await service.getById(userId!);

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
            sub: user.id,
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
            sub: user.id,
            exp: getExpTimestamp(REFRESH_TOKEN_EXP),
          });
          refreshToken.set({
            value: refreshJWTToken,
            httpOnly: true,
            maxAge: REFRESH_TOKEN_EXP,
            path: "/",
          });

          const updatedUser = await service.update({
            id: userId,
            isOnline: true,
            refreshToken: refreshJWTToken,
          } as UserUpdateDTO);

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
        const service = new UserService();
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
        const user = (await service.getById(userId!)) as User;

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
          const service = new UserService();
          const jwtPayload = await jwt.verify(accessToken.value);
          if (jwtPayload) {
            // verify user exists or not
            const user = await service.getById(jwtPayload.sub!);
            if (user) {
              await service.update({
                id: user.id,
                isOnline: false,
                refreshToken: null,
              } as UserUpdateDTO);
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
