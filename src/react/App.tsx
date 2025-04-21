import React from "react";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import ToDoPage from "./components/ToDo";
import TeamPage from "./components/Team";
import Nav from "./components/Nav";

import "./App.css";
import Login from "./components/Login";
import HomePage from "./components/Home";
import { loginRoute, registerRoute, teamRoute, todoRoute } from "../constants";
import Register from "./components/Register";
import { UserDTO } from "../types/User/UserDTO";
import ForbiddenPage from "./components/Forbidden";

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
            <Nav user={user} />
            <Outlet />

            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route
                path={`${todoRoute}`}
                element={user.id ? <ToDoPage user={user} /> : <ForbiddenPage />}
              />
              <Route
                path={`${teamRoute}`}
                element={user.id ? <TeamPage user={user} /> : <ForbiddenPage />}
              />
              <Route path={`${loginRoute}`} element={<Login />} />
              <Route path={`${registerRoute}`} element={<Register />} />
            </Routes>
          </HydrationBoundary>
        </QueryClientProvider>
      </body>
    </html>
  );
};

export default App;
