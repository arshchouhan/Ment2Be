import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { TASK_API_URL } from "../../config/apiConfig.js";

export function StatsCards() {
  const [stats, setStats] = useState([
    {
      label: "Active Tasks",
      value: 0,
      icon: Clock,
      color: "bg-gray-800",
      iconColor: "text-gray-400",
    },
    {
      label: "Pending Review",
      value: 0,
      icon: AlertCircle,
      color: "bg-gray-800",
      iconColor: "text-gray-400",
    },
    {
      label: "Completed",
      value: 0,
      icon: CheckCircle,
      color: "bg-gray-800",
      iconColor: "text-gray-400",
    },
    {
      label: "Avg Completion",
      value: "0%",
      icon: TrendingUp,
      color: "bg-gray-800",
      iconColor: "text-gray-400",
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
          color: "bg-gray-800",
          iconColor: "text-gray-400",
        },
        {
          label: "Pending Review",
          value: pendingReview,
          icon: AlertCircle,
          color: "bg-gray-800",
          iconColor: "text-gray-400",
        },
        {
          label: "Completed",
          value: completed,
          icon: CheckCircle,
          color: "bg-gray-800",
          iconColor: "text-gray-400",
        },
        {
          label: "Avg Completion",
          value: `${avgCompletion}%`,
          icon: TrendingUp,
          color: "bg-gray-800",
          iconColor: "text-gray-400",
        },
      ]);
    } catch (err) {
      console.error('Error fetching task stats:', err);
    }
  };

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
