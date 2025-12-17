import React from 'react';
import { FiUsers, FiStar, FiClock, FiMessageSquare, FiDollarSign, FiUser, FiCode, FiGlobe } from 'react-icons/fi';

const categories = [
  { name: 'All Mentors', count: 24, icon: <FiUsers className="mr-2" size={18} style={{ color: '#ffffff' }} /> },
  { name: 'Software Engineering', count: 15, icon: <FiCode className="mr-2" size={18} style={{ color: '#ffffff' }} /> },
  { name: 'Product Management', count: 10, icon: <FiClock className="mr-2" size={18} style={{ color: '#ffffff' }} /> },
  { name: 'Career Guidance', count: 18, icon: <FiMessageSquare className="mr-2" size={18} style={{ color: '#ffffff' }} /> },
  { name: 'Business & Marketing', count: 12, icon: <FiDollarSign className="mr-2" size={18} style={{ color: '#ffffff' }} /> },
  { name: 'Design & UX', count: 9, icon: <FiStar className="mr-2" size={18} style={{ color: '#ffffff' }} /> },
  { name: 'Data Science & AI', count: 14, icon: <FiStar className="mr-2" size={18} style={{ color: '#ffffff' }} /> },
  { name: 'Web Development', count: 20, icon: <FiGlobe className="mr-2" size={18} style={{ color: '#ffffff' }} /> },
];

const CategoryList = ({ activeCategory, onCategoryClick }) => {
  return (
    <div className="bg-[#121212] rounded-lg border border-gray-700 overflow-hidden flex flex-col h-[450px]">
      <div className="p-2 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-md font-semibold text-white">Categories</h3>
      </div>
      <div className="divide-y divide-gray-700 overflow-y-auto flex-1 scrollbar-hide">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
              activeCategory === category.name ? 'bg-[#121212] text-white' : 'text-gray-300 hover:bg-gray-700/50'
            }`}
            onClick={() => onCategoryClick(category.name)}
          >
            <div className="flex items-center">
              {category.icon}
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-300" style={{ backgroundColor: '#202327' }}>
              {category.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
