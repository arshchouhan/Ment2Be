import React from 'react';

const MentorSort = ({ sortBy, onSortChange }) => {
  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'newest', label: 'Recently Joined' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-300 text-sm">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-1 bg-[#2a2d31] border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MentorSort;
