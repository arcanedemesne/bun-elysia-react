import { DehydratedState, HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";

import { MessageBars, Toasts } from "@/lib/components";
import { loginRoute, registerRoute, teamRoute, todoRoute } from "@/lib/constants";
import { UserDTO } from "@/lib/models";

import { Nav } from "./components/Nav";
import { ForbiddenPage, HomePage, LoginPage, NotFoundPage, RegisterPage, TeamPage, TodoPage } from "./pages";
import { PublicChat } from "./pages/PublicChat";
import { SocketProvider, UserProvider } from "./providers";

const App = ({ dehydratedState, user }: { dehydratedState: DehydratedState; user: UserDTO }) => {
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
              <SocketProvider>
                <Nav />
                <MessageBars />
                <Toasts />
                <Outlet />

                <Routes location={location}>
                  <Route path="/" element={<HomePage />} />
                  <Route path={`${todoRoute}`} element={user.id ? <TodoPage /> : <ForbiddenPage />} />
                  <Route path={`${teamRoute}`} element={user.id ? <TeamPage /> : <ForbiddenPage />} />
                  <Route path={`public-chat`} element={user.id ? <PublicChat /> : <ForbiddenPage />} />
                  <Route path={`${loginRoute}`} element={<LoginPage />} />
                  <Route path={`${registerRoute}`} element={<RegisterPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </SocketProvider>
            </UserProvider>
          </HydrationBoundary>
        </QueryClientProvider>
      </body>
    </html>
  );
};

export default App;
