import React from "react";

const StatusBadge = ({ status }) => {
  let colorClass = "";

  switch (status) {
    case "Delivered":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "Shipped":
      colorClass = "bg-primary-blue/20 text-primary-blue";
      break;
    case "Processing":
      colorClass = "bg-primary-yellow/30 text-yellow-800";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
