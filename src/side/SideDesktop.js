// src/side/SideDesktop.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./SideDesktop.css";

export const SideDesktop = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "멤버", path: "/members" },
    { label: "그룹", path: "/groups" },
    { label: "팀", path: "/teams" },
    { label: "행사", path: "/events" },
    { label: "일정", path: "/schedule" },
  ];

  return (
    <div className="side-desktop">
      <ul>
        {menuItems.map((item) => (
          <li key={item.path} onClick={() => navigate(item.path)}>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
