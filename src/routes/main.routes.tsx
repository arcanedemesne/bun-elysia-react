import App from "../react/App";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import React from "react";
import { renderToReadableStream } from "react-dom/server";
import { StaticRouter } from "react-router";

import Elysia from "elysia";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { UserDTO } from "@/lib/models";
import { JwtContext } from "@/lib/types";

import { UserRepository } from "../respositories";
import ScriptInjectionStream from "../scriptInjectionStream";

export const mainRoutes = (app: Elysia<any, any, any, any, JwtContext>) => {
  const apiHost = `${app.server?.hostname}:${app.server?.port}`;

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

  return app.get("*", async ({ request, cookie: { accessToken }, jwt }) => {
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
        const user = await new UserRepository().getById(userId!);
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
  });
};
