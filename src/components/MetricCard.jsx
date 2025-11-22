import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const MetricCard = ({ title, value, percentage, isPositive, icon: Icon, colorClass }) => (
  <div className={`p-6 bg-white rounded-xl shadow-md border-b-4 ${colorClass}`}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <Icon className={`w-6 h-6 ${colorClass.replace('border-b-4', '').replace('/50', '').replace('border-', 'text-')}`} />
    </div>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    <div className="flex items-center text-sm mt-2">
      <span className={`font-semibold mr-1 flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {percentage}
      </span>
      <span className="text-gray-500">vs. last period</span>
    </div>
  </div>
);

export default MetricCard;
