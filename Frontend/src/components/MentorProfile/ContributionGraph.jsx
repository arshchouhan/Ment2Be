import React from 'react';

const ContributionGraph = ({ mentorData }) => {
  // Generate contribution data (this would come from API in real app)
  const generateContributionData = () => {
    const weeks = 53;
    const data = [];
    
    for (let week = 0; week < weeks; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        // Random contribution level (0-4)
        const level = Math.floor(Math.random() * 5);
        weekData.push({
          date: new Date(2024, 0, week * 7 + day + 1),
          level,
          count: level * Math.floor(Math.random() * 3) + level
        });
      }
      data.push(weekData);
    }
    return data;
  };

  const contributionData = generateContributionData();
  const totalSessions = mentorData?.stats?.sessionsCompleted || 0;

  const getColorClass = (level) => {
    const colors = [
      'bg-[#2d333b]', // 0 contributions
      'bg-[#3d3d3d]', // 1-2 contributions
      'bg-[#4a4a4a]', // 3-4 contributions
      'bg-[#5a5a5a]', // 5-6 contributions
      'bg-[#6a6a6a]'  // 7+ contributions
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
