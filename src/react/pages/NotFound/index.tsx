import React from "react";
import { loginRoute } from "../../../constants";

export const NotFoundPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">404 Not Found</h1>
        <p className="mb-8 text-lg text-gray-600">
          We couldn't find what you were looking for.
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
