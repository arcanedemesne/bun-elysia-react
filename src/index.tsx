import React from "react";
import { StaticRouter } from "react-router";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { Elysia, error } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import jwt from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { renderToReadableStream } from "react-dom/server";
import { v4 as uuidv4 } from "uuid";

import App from "./react/App";
import { ToDoItem } from "./types/ToDo";
import ScriptInjectionStream from "./scriptInjectionStream";
import InMemoryDB from "./inMemoryDb";
import { User } from "./types/User";
import { LoginInfo } from "./types/LoginInfo";
import {
  ACCESS_TOKEN_EXP,
  REFRESH_TOKEN_EXP,
  apiPrefix,
  authPrefix,
  checkRoute,
  hostPort,
  loginRoute,
  logoutRoute,
  registerRoute,
  secret,
  todoRoute,
  userRoute,
} from "./constants";

const getExpTimestamp = (secondsFromNow: number) => {
  return Math.floor(Date.now() / 1000) + secondsFromNow;
};

await Bun.build({
  entrypoints: ["./src/react/index.tsx"],
  outdir: "./public",
});

async function fetchData(queryClient: QueryClient, url: string) {
  if (url === "/todos") {
    await queryClient.prefetchQuery({
      queryKey: ["todoData"],
      queryFn: async () => {
        const response = await app.handle(
          new Request(`${apiHost}/${apiPrefix}/${todoRoute}`),
        );
        const data = await response.json();
        return data;
      },
    });
  }
}

// Init DB
const inMemoryDB = new InMemoryDB();
inMemoryDB.initDB();

const app = new Elysia()
  .use(staticPlugin())
  .use(swagger())
  .decorate("inMemoryDB", inMemoryDB)
  .use(
    cookie({
      secret,
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret,
    }),
  )

  // MAIN ROUTE
  .get("*", async ({ request }) => {
    const url = new URL(request.url).pathname;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: Infinity,
          staleTime: Infinity,
        },
      },
    });

    await fetchData(queryClient, url);

    const dehydratedState = dehydrate(queryClient);
    const dehydratedString = JSON.stringify(dehydratedState);

    // render the app component to a readable stream
    const stream = await renderToReadableStream(
      <StaticRouter location={url}>
        <App dehydratedState={dehydratedState} />
      </StaticRouter>,
      {
        onError(error) {
          console.error(error);
        },
      },
    );

    const modifiedStream = stream.pipeThrough(
      new ScriptInjectionStream(dehydratedString),
    );

    const response = new Response(modifiedStream, {
      headers: { "Content-Type": "text/html" },
    });

    return response;
  })

  // get user during request
  .derive(
    async ({ inMemoryDB, jwt, cookie: { accessToken }, set, request }) => {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Exclude static asset paths
      if (
        pathname === "/" ||
        pathname.startsWith(`/${apiPrefix}/${authPrefix}/${loginRoute}`) ||
        pathname.startsWith(`/${apiPrefix}/${authPrefix}/${registerRoute}`) ||
        pathname.startsWith(`/${apiPrefix}/${authPrefix}/${logoutRoute}`) ||
        pathname.startsWith(`/${apiPrefix}/${authPrefix}/${checkRoute}`) ||
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
      const user = inMemoryDB.users.find((user) => user.id === userId);

      if (!user) {
        // handle error for user not found from the provided access token
        set.status = 403;
        throw new Error("Access token is invalid");
      }

      return {
        user,
      };
    },
  )

  // TODOS
  .get(`/${apiPrefix}/${todoRoute}`, ({ inMemoryDB }) => inMemoryDB.todos)
  .get(`/${apiPrefix}/${todoRoute}/:id`, ({ inMemoryDB, params: { id } }) => {
    const todo = inMemoryDB.todos.find((todo) => todo.id === id);
    if (!todo) {
      error(404);
    }
    return todo;
  })
  .post(`/${apiPrefix}/${todoRoute}`, ({ inMemoryDB, body }) => {
    const parsed = JSON.parse(body as string);
    inMemoryDB.todos.push(parsed as ToDoItem);
  })
  .delete(
    `/${apiPrefix}/${todoRoute}/:id`,
    ({ inMemoryDB, params: { id } }) => {
      const index = inMemoryDB.todos.findIndex(
        (todo: ToDoItem) => todo.id === id,
      );
      inMemoryDB.todos.splice(index, 1);
    },
  )

  // USERS
  .get(`/${apiPrefix}/${userRoute}`, ({ inMemoryDB }) => inMemoryDB.users)
  .get(`/${apiPrefix}/${userRoute}/:id`, ({ inMemoryDB, params: { id } }) => {
    const user = inMemoryDB.users.find((user) => user.id === id);
    if (!user) {
      error(404);
    }
    return user;
  })
  .post(`/${apiPrefix}/${userRoute}`, ({ inMemoryDB, body }) => {
    const parsed = JSON.parse(body as string);
    inMemoryDB.users.push(parsed as User);
  })
  .delete(
    `/${apiPrefix}/${userRoute}/:id`,
    ({ inMemoryDB, params: { id } }) => {
      const index = inMemoryDB.users.findIndex((user: User) => user.id === id);
      inMemoryDB.users.splice(index, 1);
    },
  )

  // LOGIN
  .post(
    `/${apiPrefix}/${authPrefix}/${loginRoute}`,
    async ({
      inMemoryDB,
      body,
      jwt,
      cookie: { accessToken, refreshToken },
      set,
    }) => {
      const loginInfo = JSON.parse(body as string) as LoginInfo;

      const user = inMemoryDB.users.find(
        (user: User) => user.username === loginInfo.username,
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

        user.isOnline = true;
        user.refreshToken = refreshJWTToken;

        set.status = 200;
        return {
          successful: true,
          errorMessage: "",
        };
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
    async ({
      inMemoryDB,
      body,
      jwt,
      cookie: { accessToken, refreshToken },
      set,
    }) => {
      const loginInfo = JSON.parse(body as string) as LoginInfo;

      const user = inMemoryDB.users.find(
        (user: User) => user.username === loginInfo.username,
      );
      if (user) {
        set.status = 422;
        return {
          successful: false,
          errorMessage: "Username already exists",
        };
      }

      const newUser = {
        id: uuidv4(),
        username: loginInfo.username,
        password: await Bun.password.hash(loginInfo.password.toString()),

        isOnline: false,
        refreshToken: null,
      } as User;

      inMemoryDB.users.push(newUser);

      const token = await jwt.sign({
        sub: newUser.id.toString(),
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
        sub: newUser.id.toString(),
        exp: getExpTimestamp(REFRESH_TOKEN_EXP),
      });
      refreshToken.set({
        value: refreshJWTToken,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXP,
        path: "/",
      });

      newUser.isOnline = true;
      newUser.refreshToken = refreshJWTToken;

      set.status = 200;
      return {
        successful: true,
        errorMessage: "",
      };
    },
  )

  .post(
    `/${apiPrefix}/${authPrefix}/refresh`,
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
      const user = inMemoryDB.users.find((user: User) => user.id === userId);

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

      user.refreshToken = refreshJWTToken;

      return {
        message: "Access token generated successfully",
        data: {
          accessToken: accessJWTToken,
          refreshToken: refreshJWTToken,
        },
      };
    },
  )
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
        const user = inMemoryDB.users.find((user) => user.id === userId);

        if (!user || !user.isOnline) {
          // handle error for user not found from the provided access token
          set.status = 403;
          throw new Error("Access token is invalid");
        }

        return { authenticated: true, username: user.username }; // Include username in response
      } catch (error) {
        set.status = 401;
        return { authenticated: false };
      }
    },
  )
  .post(
    `/${apiPrefix}/${authPrefix}/${logoutRoute}`,
    ({ cookie: { accessToken, refreshToken }, set }) => {
      // verify user exists or not
      const user = inMemoryDB.users.find(
        (user: User) => user.id === accessToken.value,
      );

      if (user) {
        user.isOnline = false;
        user.refreshToken = null;
      }

      accessToken.remove();
      refreshToken.remove();
      set.status = 200;
      return { message: "Logged out" };
    },
  )

  .listen(hostPort);

const apiHost = `${app.server?.hostname}:${app.server?.port}`;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
