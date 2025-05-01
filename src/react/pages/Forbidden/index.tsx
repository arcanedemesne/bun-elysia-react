import React from "react";

import { loginRoute } from "@/lib/constants";

export const ForbiddenPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">403 Forbidden</h1>
        <p className="mb-8 text-lg text-gray-600">
          You must be logged in to access this page!
        </p>
        <a
          href={`/${loginRoute}`}
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:shadow-lg"
        >
          Login to begin
        </a>
      </div>
    </div>
  );
};
