import React from "react";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  loginRoute,
  registerRoute,
  teamRoute,
  todoRoute,
} from "@/lib/constants";
import { UserDTO } from "@/lib/models";
import { UserProvider } from "@/providers";
import { Nav } from "@/components";

import {
  HomePage,
  Login,
  Register,
  ForbiddenPage,
  ToDoPage,
  TeamPage,
  NotFoundPage,
} from "./pages";

import "./App.css";

type AppProps = {
  dehydratedState: DehydratedState;
  user: UserDTO;
};

const App = ({ dehydratedState, user }: AppProps) => {
  const location = useLocation();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity, // Prevent refetching on client
        gcTime: Infinity,
      },
    },
  });

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Bun, Elysia & React</title>
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="/public/index.js" type="module" defer />
        <link rel="stylesheet" type="text/css" href="/public/index.css" />
        <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
        <link rel="icon" type="image/x-icon" href="/public/favicon.ico" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={dehydratedState}>
            <UserProvider value={user}>
              <Nav />
              <Outlet />
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route
                  path={`${todoRoute}`}
                  element={user.id ? <ToDoPage /> : <ForbiddenPage />}
                />
                <Route
                  path={`${teamRoute}`}
                  element={user.id ? <TeamPage /> : <ForbiddenPage />}
                />
                <Route path={`${loginRoute}`} element={<Login />} />
                <Route path={`${registerRoute}`} element={<Register />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </UserProvider>
          </HydrationBoundary>
        </QueryClientProvider>
      </body>
    </html>
  );
};

export default App;
