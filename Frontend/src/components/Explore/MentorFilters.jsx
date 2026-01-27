import React, { useState } from 'react';

const MentorFilters = ({ filters, onFiltersChange, availableSkills }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSkillToggle = (skill) => {
    const currentSkills = filters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];

    handleFilterChange('skills', newSkills);
  };

  const handleAvailabilityToggle = (day) => {
    const currentAvailability = filters.availability || [];
    const newAvailability = currentAvailability.includes(day)
      ? currentAvailability.filter(d => d !== day)
      : [...currentAvailability, day];

    handleFilterChange('availability', newAvailability);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      skills: [],
      minRating: '',
      minRate: '',
      maxRate: '',
      availability: [],
      location: '',
      experience: ''
    });
  };

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (value && value.toString().trim()) return count + 1;
    return count;
  }, 0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-[#2a2d31] border border-gray-600 rounded-lg text-white hover:bg-[#3a3d41] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-[#2a2d31] border border-gray-600 rounded-lg shadow-xl z-50">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-gray-400 hover:text-white text-sm"
              >
                Clear All
              </button>
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableSkills.map(skill => (
                  <label key={skill} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.skills?.includes(skill) || false}
                      onChange={() => handleSkillToggle(skill)}
                      className="rounded border-gray-600 bg-[#1a1d21] text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Rating: {filters.minRating || 'Any'}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={filters.minRating || 1}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Min Rate ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minRate}
                  onChange={(e) => handleFilterChange('minRate', e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1d21] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Max Rate ($)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={filters.maxRate}
                  onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1d21] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Available Days</label>
              <div className="grid grid-cols-2 gap-1">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <label key={day} className="flex items-center space-x-2 text-sm capitalize">
                    <input
                      type="checkbox"
                      checked={filters.availability?.includes(day) || false}
                      onChange={() => handleAvailabilityToggle(day)}
                      className="rounded border-gray-600 bg-[#1a1d21] text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
              <input
                type="text"
                placeholder="City, State, or Country"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1d21] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Min Experience (years)</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1d21] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorFilters;
