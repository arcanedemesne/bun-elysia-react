import React from "react";
import { Link, useNavigate } from "react-router";

import {
  apiPrefix,
  authPrefix,
  logoutRoute,
} from "../../../constants";
import { UserDTO } from "../../../types/UserDTO";

type NavProps = {
  user: UserDTO;
};

const Nav = ({ user }: NavProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    ("use server");

    const response = await fetch(`${apiPrefix}/${authPrefix}/${logoutRoute}`, {
      method: "POST",
    });

    if (response.status === 200) {
      location.href = "/login"; // should navigate, but there's a race condition with user state in server
      //navigate("/login");
    } else {
      alert("error");
    }
  };

  return (
    <nav className="flex items-center justify-between bg-gray-800 p-4">
      <div className="flex items-center">
        <img
          src="/public/bun.png"
          alt="Logo"
          height={50}
          className="mr-4 h-8"
        />
        <Link to="/" className="text-lg font-bold text-white">
          ToDos App
        </Link>
      </div>
      <div>
        {!user.id && (
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
            to="/login"
          >
            Login
          </Link>
        )}
        {user.id && (
          <>
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
              to="/todos"
            >
              Todos
            </Link>
            <span className="text-white">Hi {user.username}</span>
            <span
              onClick={handleLogout}
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              Logout
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
