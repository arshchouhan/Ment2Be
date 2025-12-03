import React from "react";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Active Tasks",
    value: 24,
    icon: Clock,
    color: "bg-gray-800",
    iconColor: "text-gray-400",
  },
  {
    label: "Pending Review",
    value: 8,
    icon: AlertCircle,
    color: "bg-gray-800",
    iconColor: "text-gray-400",
  },
  {
    label: "Completed",
    value: 156,
    icon: CheckCircle,
    color: "bg-gray-800",
    iconColor: "text-gray-400",
  },
  {
    label: "Avg Completion",
    value: "87%",
    icon: TrendingUp,
    color: "bg-gray-800",
    iconColor: "text-gray-400",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#121212] rounded-lg p-5 shadow-sm border border-gray-700 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
