import React from "react";
import { Link, useNavigate } from "react-router";

import {
  apiPrefix,
  authPrefix,
  loginRoute,
  logoutRoute,
  todoRoute,
  teamRoute,
} from "../../../constants";
import { UserDTO } from "../../../types";
import { apiFetch } from "../../api";

type NavProps = {
  user: UserDTO;
};

export const Nav = ({ user }: NavProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    ("use server");

    const response = await apiFetch(
      `${apiPrefix}/${authPrefix}/${logoutRoute}`,
      {
        method: "POST",
      },
    );

    if (response.status === 200) {
      location.href = `${loginRoute}`; // should navigate, but there's a race condition with user state in server
      //navigate(`${loginRoute}`);
    } else {
      alert("error");
    }
  };

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
        <Link to="/" className="text-lg font-bold text-white">
          ToDos App
        </Link>
      </div>
      <div>
        {!user.id && (
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
            to={`/${loginRoute}`}
          >
            Login
          </Link>
        )}
        {user.id && (
          <>
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
              to={`/${todoRoute}`}
            >
              Todos
            </Link>
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
              to={`/${teamRoute}`}
            >
              Teams
            </Link>
            <span
              onClick={handleLogout}
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              Logout
            </span>
            <span className="border-spacing-1 rounded-md border px-3 py-2 text-sm font-medium text-gray-300">
              {user.username}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};
