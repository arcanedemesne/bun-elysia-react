import React from "react";
import { StaticRouter } from "react-router";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { Elysia, error } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import jwt from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { renderToReadableStream } from "react-dom/server";

import App from "./react/App";
import ScriptInjectionStream from "./scriptInjectionStream";
import { LoginInfo } from "./types/LoginInfo";
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
  todoRoute,
  userRoute,
} from "./constants";
import userRepository from "./respositories/userRepository";
import todoRepository from "./respositories/todoRepository";
import { UserDTO } from "./types/User/UserDTO";
import { UserUpdate } from "./types/User/UserUpdate";
import { UserInsert } from "./types/User/UserInsert";
import { ToDoInsert } from "./types/ToDo/ToDoInsert";

const getExpTimestamp = (secondsFromNow: number) => {
  return Math.floor(Date.now() / 1000) + secondsFromNow;
};

await Bun.build({
  entrypoints: ["./src/react/index.tsx"],
  outdir: "./public",
});

async function fetchData(
  queryClient: QueryClient,
  url: string,
  userId: string,
) {
  if (url === "/todos") {
    await queryClient.prefetchQuery({
      queryKey: ["todoData", userId],
      queryFn: async () => {
        const response = await app.handle(
          new Request(`${apiHost}/${apiPrefix}/${todoRoute}/${userId}`),
        );
        const data = await response.json();
        return data;
      },
    });
  }
}

const app = new Elysia()
  .use(staticPlugin())
  .use(swagger())
  .use(
    cookie({
      secret: process.env.JWT_SECRET,
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    }),
  )

  // MAIN ROUTE
  .get("*", async ({ request, cookie: { accessToken }, jwt }) => {
    const url = new URL(request.url).pathname;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: Infinity,
          staleTime: Infinity,
        },
      },
    });

    const dehydratedState = dehydrate(queryClient);
    const dehydratedString = JSON.stringify(dehydratedState);

    let userDTO = { id: "", username: "" } as UserDTO;
    if (accessToken.value) {
      const jwtPayload = await jwt.verify(accessToken.value);
      if (jwtPayload) {
        const userId = jwtPayload.sub;
        const user = await userRepository().getUserById(userId!);
        if (user?.isOnline) {
          userDTO = {
            id: user.id,
            username: user.username,
          };
        }
      }
    }

    if (userDTO) {
      await fetchData(queryClient, url, userDTO.id);
    }

    const userDtoString = JSON.stringify(userDTO);

    // render the app component to a readable stream
    const stream = await renderToReadableStream(
      <StaticRouter location={url}>
        <App dehydratedState={dehydratedState} user={userDTO} />
      </StaticRouter>,
      {
        onError(error) {
          console.error(error);
        },
      },
    );

    const modifiedStream = stream.pipeThrough(
      new ScriptInjectionStream(dehydratedString, userDtoString),
    );

    const response = new Response(modifiedStream, {
      headers: { "Content-Type": "text/html" },
    });

    return response;
  })

  // get user during request
  .derive(async ({ jwt, cookie: { accessToken }, set, request }) => {
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
  })

  // TODOS
  .get(
    `/${apiPrefix}/${todoRoute}`,
    async () => await todoRepository().getToDos(),
  )
  .get(`/${apiPrefix}/${todoRoute}/:userId`, async ({ params: { userId } }) => {
    return await todoRepository().getToDosByUserId(userId);
  })
  .post(`/${apiPrefix}/${todoRoute}`, async ({ body }) => {
    const parsed = JSON.parse(body as string);
    const todo = await todoRepository().insertToDo(parsed as ToDoInsert);
    if (!todo) {
      error(409);
    }
    return todo;
  })
  .delete(`/${apiPrefix}/${todoRoute}/:id`, async ({ params: { id } }) => {
    const success = await todoRepository().deleteToDo(id);
    if (!success) {
      error(404);
    }
  })

  // USERS
  .get(
    `/${apiPrefix}/${userRoute}`,
    async () => await userRepository().getUsers(),
  )
  .get(`/${apiPrefix}/${userRoute}/:id`, async ({ params: { id } }) => {
    const user = await userRepository().getUserById(id);
    if (!user) {
      error(404);
    }
    return user;
  })
  .post(`/${apiPrefix}/${userRoute}`, async ({ body }) => {
    const parsed = JSON.parse(body as string);
    const user = await userRepository().insertUser(parsed as UserInsert);
    if (!user) {
      error(409);
    }
    return user;
  })
  .delete(`/${apiPrefix}/${userRoute}/:id`, async ({ params: { id } }) => {
    const success = await userRepository().deleteUser(id);
    if (!success) {
      error(404);
    }
  })

  // LOGIN
  .post(
    `/${apiPrefix}/${authPrefix}/${loginRoute}`,
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
    `/${apiPrefix}/${authPrefix}/${registerRoute}`,
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

      const updatedUser = await userRepository().updateUser(insertedUser.id, {
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
      set.status = 401;
      return {
        successful: false,
        errorMessage: "Failed to update user with token",
      };
    },
  )

  // REFRESH
  .post(
    `/${apiPrefix}/${authPrefix}/${refreshRoute}`,
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
  .get(
    `/${apiPrefix}/${authPrefix}/${checkRoute}`,
    async ({ cookie: { accessToken }, jwt, set }) => {
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
    },
  )
  .post(
    `/${apiPrefix}/${authPrefix}/${logoutRoute}`,
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
  )

  .listen(Number(process.env.HOST_PORT));

const apiHost = `${app.server?.hostname}:${app.server?.port}`;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
