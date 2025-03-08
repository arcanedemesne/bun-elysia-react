import React from "react";
import { Link } from "react-router";

const Nav = () => {
  return (
    <nav className="bg-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <img src="/public/bun.png" alt="Logo" height={50} className="h-8 mr-4" />
        <Link
          to="/"
          className="text-white font-bold text-lg"
        >
          ToDos
        </Link>
      </div>
      <div>
        <Link
          className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          to="/login"
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
