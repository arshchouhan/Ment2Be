import React from 'react';

const offerings = [
  { id: 1, name: 'Mock Interviews' },
  { id: 2, name: 'Resume Review' },
  { id: 3, name: 'Career Guidance' },
  { id: 4, name: 'Salary Negotiation' },
  { id: 5, name: 'Coding Tutoring' },
  { id: 6, name: 'Personal Branding' }
];

const TopOfferings = () => {
  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 p-4 w-[270px]">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h3 className="text-sm font-semibold text-white">Top Offerings</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        {offerings.map((offering) => (
          <button
            key={offering.id}
            className="bg-gray-700 text-gray-200 text-xs font-medium py-2 px-3 rounded-md hover:bg-gray-700 transition-colors text-center whitespace-nowrap border border-gray-700 w-[120px]"
          >
            {offering.name}
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <button className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
          View All
        </button>
      </div>
    </div>
  );
};

export default TopOfferings;