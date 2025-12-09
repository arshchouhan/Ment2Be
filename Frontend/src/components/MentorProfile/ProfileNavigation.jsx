import React from 'react';

const ProfileNavigation = ({ activeTab = 'overview', onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'reviews', label: 'Reviews', count: 2 },
    { id: 'achievements', label: 'Achievements', count: 23 },
    { id: 'sessions', label: 'Group sessions', count: 1 },
  ];

  return (
    <div className="bg-[#121212] border border-[#333] rounded-lg">
      <div className="border-b border-[#333]">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="bg-[#2d2d2d] text-gray-300 py-1 px-2 rounded-full text-xs ml-2">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProfileNavigation;
