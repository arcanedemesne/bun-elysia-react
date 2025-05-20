import React from "react";
import { NavLink, useNavigate } from "react-router";

import {
  apiPrefix,
  authPrefix,
  loginRoute,
  logoutRoute,
  teamRoute,
  todoRoute,
} from "@/lib/constants";
import { ApiService } from "@/lib/services";

import { useUserContext } from "@/providers";

export const Nav = () => {
  const apiService = new ApiService();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const handleLogout = async () => {
    ("use server");

    const response = await apiService.post(
      `${apiPrefix}/${authPrefix}/${logoutRoute}`,
    );

    if (response.status === 200) {
      location.href = `${loginRoute}`; // should navigate, but there's a race condition with user state in server
      //navigate(`${loginRoute}`);
    } else {
      alert("error");
    }
  };

  const activeNavLinkClassName =
    "rounded-md px-3 py-2 text-sm font-bold text-gray-100 hover:text-white bg-gray-600 hover:bg-gray-700 cursor-pointer";
  const navLinkClassName =
    "rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-700 cursor-pointer";
  return (
    <nav
      className="flex items-center justify-between bg-gray-800 p-4"
      style={{ height: 60 }}
    >
      <div className="flex items-center">
        <img
          src="/public/bun.png"
          alt="Logo"
          height={50}
          className="mr-4 h-8 cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        />
        <NavLink to="/" className="text-lg font-bold text-white">
          Todo App
        </NavLink>
      </div>
      <div>
        {!user?.id && (
          <NavLink
            className={({ isActive }) =>
              isActive ? activeNavLinkClassName : navLinkClassName
            }
            to={`/${loginRoute}`}
          >
            Login
          </NavLink>
        )}
        {user?.id && (
          <>
            <NavLink
              className={({ isActive }) =>
                isActive ? activeNavLinkClassName : navLinkClassName
              }
              to={`/${todoRoute}`}
            >
              Todos
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? activeNavLinkClassName : navLinkClassName
              }
              to={`/${teamRoute}`}
            >
              Teams
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? activeNavLinkClassName : navLinkClassName
              }
              to={`/public-chat`}
            >
              Public Chat
            </NavLink>
            <span onClick={handleLogout} className={navLinkClassName}>
              Logout
            </span>
            <span className="ml-2 border-spacing-1 rounded-md border px-3 py-2 text-sm font-medium text-gray-300">
              {user.username}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};
