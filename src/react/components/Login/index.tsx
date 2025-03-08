import React from "react";

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-96 rounded bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-semibold">Login</h2>

        <form>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Enter username"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Enter password"
            />
          </div>

          <div className="flex items-center justify-between">
            <a
              href="#"
              className="inline-block align-baseline text-sm font-semibold text-purple-500 hover:text-purple-800"
            >
              Forgot Password?
            </a>
            <button
              type="submit"
              className="ml-2 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
