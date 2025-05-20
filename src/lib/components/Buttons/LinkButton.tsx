import React from "react";
import { Link, LinkProps } from "react-router-dom";

export const LinkButton = ({ to, children }: LinkProps) => (
  <Link
    to={to}
    className="inline-block align-baseline text-sm font-semibold text-gray-500 hover:text-gray-800"
  >
    {children}
  </Link>
);
