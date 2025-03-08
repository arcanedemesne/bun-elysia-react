import React from "react";
import { Link } from "react-router";

const Nav = () => {
  return (
    <nav>
      <div className="logo">
        <Link to="/" style={{ textDecoration: "none", color: "black" }}>ToDos</Link>
      </div>
      <div className="nav-right">
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Nav;
