import { Elysia } from "elysia";
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
} from "../constants";
import { LoginInfo, UserUpdate, UserInsert, JwtContext } from "../types";
import { userRepository } from "../respositories";

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
          const loginInfo = JSON.parse(body as string) as LoginInfo;

          const user = await userRepository().getUserByUsername(
            loginInfo.username.toString(),
          );
          if (!user) {
            set.status = 404;
            return {
              successful: false,
              errorMessage: "User does not exist",
            };
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

            const updatedUser = await userRepository().updateUser(user.id, {
              isOnline: true,
              refreshToken: refreshJWTToken,
            } as UserUpdate);

            if (updatedUser?.isOnline) {
              set.status = 200;
              return {
                successful: true,
                errorMessage: "",
              };
            }
          }
          set.status = 401;
          return {
            successful: false,
            errorMessage: "Invalid user credentials",
          };
        },
      )

      // REGISTER
      .post(
        `/${registerRoute}`,
        async ({ body, jwt, cookie: { accessToken, refreshToken }, set }) => {
          const loginInfo = JSON.parse(body as string) as LoginInfo;

          const user = await userRepository().getUserByUsername(
            loginInfo.username.toString(),
          );

          if (user) {
            set.status = 422;
            return {
              successful: false,
              errorMessage: "Username already exists",
            };
          }

          const newUser = {
            username: loginInfo.username,
            password: await Bun.password.hash(loginInfo.password.toString()),

            isOnline: false,
            refreshToken: null,
          } as UserInsert;

          const insertedUser = await userRepository().insertUser(newUser);
          if (!insertedUser) {
            set.status = 409;
            return {
              successful: false,
              errorMessage: "Error creating user",
            };
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

          const updatedUser = await userRepository().updateUser(
            insertedUser.id,
            {
              isOnline: true,
              refreshToken: refreshJWTToken,
            } as UserUpdate,
          );

          if (updatedUser?.isOnline) {
            set.status = 200;
            return {
              successful: true,
              errorMessage: "",
            };
          }
          set.status = 401;
          return {
            successful: false,
            errorMessage: "Failed to update user with token",
          };
        },
      )

      // REFRESH
      .post(
        `/${refreshRoute}`,
        async ({ cookie: { accessToken, refreshToken }, jwt, set }) => {
          if (!refreshToken.value) {
            // handle error for refresh token is not available
            set.status = 401;
            throw new Error("Refresh token is missing");
          }
          // get refresh token from cookie
          const jwtPayload = await jwt.verify(refreshToken.value);
          if (!jwtPayload) {
            // handle error for refresh token is tempted or incorrect
            set.status = 403;
            throw new Error("Refresh token is invalid");
          }

          // get user from refresh token
          const userId = jwtPayload.sub;

          // verify user exists or not
          const user = await userRepository().getUserById(userId!);

          if (!user) {
            // handle error for user not found from the provided refresh token
            set.status = 403;
            throw new Error("Refresh token is invalid");
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

          const updatedUser = await userRepository().updateUser(user.id, {
            isOnline: true,
            refreshToken: refreshJWTToken,
          } as UserUpdate);

          if (updatedUser?.isOnline) {
            set.status = 200;
            return {
              successful: true,
              message: "Access token generated successfully",
            };
          }
          set.status = 401;
          return {
            successful: false,
            errorMessage: "Failed to update user with token",
          };
        },
      )

      // CHECK AUTH
      .get(`/${checkRoute}`, async ({ cookie: { accessToken }, jwt, set }) => {
        if (!accessToken) {
          set.status = 401;
          return { authenticated: false };
        }

        try {
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

          if (!user || !user.isOnline) {
            // handle error for user not found from the provided access token
            set.status = 403;
            throw new Error("Access token is invalid");
          }

          return { authenticated: true };
        } catch (error) {
          set.status = 401;
          return { authenticated: false };
        }
      })

      // LOGOUT
      .post(
        `/${logoutRoute}`,
        async ({ cookie: { accessToken, refreshToken }, set, jwt }) => {
          const jwtPayload = await jwt.verify(accessToken.value);
          if (jwtPayload) {
            // verify user exists or not
            const user = await userRepository().getUserById(jwtPayload.sub!);
            if (user) {
              await userRepository().updateUser(user.id, {
                isOnline: false,
                refreshToken: null,
              } as UserUpdate);
            }
          }
          accessToken.remove();
          refreshToken.remove();
          set.status = 200;
          return { message: "Logged out" };
        },
      ),
  );
};
