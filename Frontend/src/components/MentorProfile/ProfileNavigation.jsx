import React from 'react';

const ProfileNavigation = ({ activeTab = 'overview', onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'reviews', label: 'Reviews', count: 2 },
    { id: 'achievements', label: 'Achievements', count: 23 },
    { id: 'sessions', label: 'Group sessions', count: 1 },
  ];

  return (
    <div className="bg-[#121212] border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs ml-2">
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
