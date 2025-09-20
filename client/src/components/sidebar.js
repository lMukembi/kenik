import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/sidebar.css";

export const Sidebar = () => {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/settings", label: "Settings" },
    { to: "/mikrotik", label: "Mikrotik" },
  ];

  return (
    <div className="sidebar">
      <ul className="sidebaritems">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`sidebarlink ${
                location.pathname === link.to ? "active" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
