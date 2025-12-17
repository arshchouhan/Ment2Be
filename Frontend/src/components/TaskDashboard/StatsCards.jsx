import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { TASK_API_URL } from "../../config/apiConfig.js";

export function StatsCards() {
  const [stats, setStats] = useState([
    {
      label: "Active Tasks",
      value: 0,
      icon: Clock,
      color: "bg-[#2a3038]",
      iconColor: "text-white",
    },
    {
      label: "Pending Review",
      value: 0,
      icon: AlertCircle,
      color: "bg-[#2a3038]",
      iconColor: "text-white",
    },
    {
      label: "Completed",
      value: 0,
      icon: CheckCircle,
      color: "bg-[#2a3038]",
      iconColor: "text-white",
    },
    {
      label: "Avg Completion",
      value: "0%",
      icon: TrendingUp,
      color: "bg-[#2a3038]",
      iconColor: "text-white",
    },
  ]);

  useEffect(() => {
    fetchTaskStats();
  }, []);

  const fetchTaskStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(TASK_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const tasks = data.tasks || (Array.isArray(data) ? data : []);

      // Calculate stats
      const activeTasks = tasks.filter(t => t.status === 'in-progress').length;
      const pendingReview = tasks.filter(t => t.status === 'pending-review').length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      const avgCompletion = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats([
        {
          label: "Active Tasks",
          value: activeTasks,
          icon: Clock,
          color: "bg-[#2a3038]",
          iconColor: "text-white",
        },
        {
          label: "Pending Review",
          value: pendingReview,
          icon: AlertCircle,
          color: "bg-[#2a3038]",
          iconColor: "text-white",
        },
        {
          label: "Completed",
          value: completed,
          icon: CheckCircle,
          color: "bg-[#2a3038]",
          iconColor: "text-white",
        },
        {
          label: "Avg Completion",
          value: `${avgCompletion}%`,
          icon: TrendingUp,
          color: "bg-[#2a3038]",
          iconColor: "text-white",
        },
      ]);
    } catch (err) {
      console.error('Error fetching task stats:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#121212] rounded-lg px-4 py-3 shadow-sm border border-gray-700 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
