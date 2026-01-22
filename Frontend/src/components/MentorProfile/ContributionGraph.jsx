import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/backendConfig';

const ContributionGraph = ({ mentorData, mentorId }) => {
  const [contributionData, setContributionData] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        console.log('🔍 [ContributionGraph] Starting fetch...');
        console.log('📋 [ContributionGraph] Token exists:', !!token);
        console.log('📅 [ContributionGraph] Selected year:', selectedYear);
        
        if (!token) {
          console.warn('⚠️ [ContributionGraph] No token found');
          setLoading(false);
          return;
        }

        const url = `${API_BASE_URL}/bookings/completed-by-date?year=${selectedYear}&mentorId=${mentorId}`;
        console.log('🌐 [ContributionGraph] Fetching from:', url);
        console.log('👤 [ContributionGraph] Mentor ID being sent:', mentorId);

        // Fetch completed sessions grouped by date from the new backend endpoint
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📡 [ContributionGraph] Response status:', response.status);
        const data = await response.json();
        console.log('📦 [ContributionGraph] Response data:', data);
        
        if (response.ok && data.success) {
          console.log('✅ [ContributionGraph] Success! Total sessions:', data.data.totalCompletedSessions);
          console.log('📊 [ContributionGraph] Sessions by date:', data.data.sessionsByDate);
          
          setTotalSessions(data.data.totalCompletedSessions);
          
          // Get available years from 2023 to current year
          const years = new Set();
          const currentYear = new Date().getFullYear();
          
          // Add years from 2023 to current year
          for (let year = 2023; year <= currentYear; year++) {
            years.add(year);
          }
          
          const sortedYears = Array.from(years).sort((a, b) => b - a);
          setAvailableYears(sortedYears);

          // Generate contribution grid from backend data
          const sessionsByDate = data.data.sessionsByDate;
          const weeks = 53;
          const graphData = [];
          const yearStart = new Date(selectedYear, 0, 1);
          
          // Build the contribution grid
          for (let week = 0; week < weeks; week++) {
            const weekData = [];
            for (let day = 0; day < 7; day++) {
              const date = new Date(yearStart);
              date.setDate(date.getDate() + week * 7 + day);
              const dateKey = date.toISOString().split('T')[0];
              const sessionData = sessionsByDate[dateKey];
              const count = sessionData ? sessionData.count : 0;
              
              // Determine level based on session count (0-4)
              let level = 0;
              if (count > 0) level = 1;
              if (count > 1) level = 2;
              if (count > 3) level = 3;
              if (count > 5) level = 4;

              weekData.push({
                date,
                level,
                count
              });
            }
            graphData.push(weekData);
          }
          setContributionData(graphData);
          console.log('🎨 [ContributionGraph] Graph data generated successfully');
        } else {
          console.error('❌ [ContributionGraph] API error:', data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('💥 [ContributionGraph] Error fetching session data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [selectedYear]);

  const getColorClass = (level) => {
    const colors = [
      'bg-[#1a1a1a]', // 0 contributions - very dark
      'bg-[#0ea5e9]', // 1-2 contributions - light blue
      'bg-[#06b6d4]', // 3-4 contributions - cyan
      'bg-[#10b981]', // 5-6 contributions - emerald green
      'bg-[#f59e0b]'  // 7+ contributions - amber/gold
    ];
    return colors[level] || colors[0];
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 overflow-x-auto">
      <div className="min-w-max w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            {totalSessions} total mentorship sessions
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-white hover:border-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          {/* Month labels */}
          <div className="flex justify-between text-xs text-gray-400 mb-2 ml-10">
            {months.map((month, index) => (
              <span key={month} className={index % 2 === 0 ? '' : 'opacity-0'}>
                {month}
              </span>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-between text-xs text-gray-400 mr-1 h-14">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Grid */}
            <div className="flex space-x-1 flex-1">
              {contributionData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col space-y-1 flex-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getColorClass(day.level)} hover:ring-2 hover:ring-gray-500 cursor-pointer`}
                      title={`${day.count} contributions on ${day.date.toDateString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getColorClass(level)}`}
                />
              ))}
              <span className="text-xs text-gray-400">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
