import React from "react";
import { Link } from "react-router-dom";

const SidebarLink = ({ children, isActive, icon: Icon, to }) => {
  
  const activeStyle = {
    backgroundColor: "#214071",
    color: "#dfb020",
    fontWeight: 600,
    borderRadius: "12px",
    textDecoration: "none"
  };

  const normalStyle = {
    color: "white",
    borderRadius: "12px",
    textDecoration: "none"
  };

  return (
    <Link
      to={to}
      style={isActive ? activeStyle : normalStyle}
      className="flex items-center gap-3 p-3 transition duration-150 hover:bg-slate-700"
    >
      <Icon
        style={{
          width: 20,
          height: 20,
          color: isActive ? "#dfb020" : "white"
        }}
      />
      <span>{children}</span>
    </Link>
  );
};

export default SidebarLink;
