import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

const experts = [
  {
    id: 1,
    name: 'Nishant Tiwari',
    company: 'Google',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    verified: true
  },
  {
    id: 2,
    name: 'Susmita Sen Ribhu',
    company: 'Microsoft',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    verified: true
  },
  {
    id: 3,
    name: 'Bhavesh Arora',
    company: 'Amazon',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    verified: false
  },
  {
    id: 4,
    name: 'ANKUR KESHARWANI',
    company: 'Facebook',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    verified: true
  }
];

const TopExperts = () => {
  return (
    <div className="bg-[#121212] rounded-lg border border-[#202327] overflow-hidden flex flex-col h-[350px] w-[270px]">
      <div className="p-2 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-md font-semibold text-white">Top Experts</h3>
      </div>
      <div className="divide-y divide-gray-700 overflow-y-auto flex-1 scrollbar-hide">
        {experts.map((expert) => (
          <div key={expert.id} className="p-3 hover:bg-gray-700/50 cursor-pointer transition-colors">
            <div className="flex items-center">
              <div className="relative">
                <img
                  className="h-10 w-10 rounded-full object-cover border border-gray-600"
                  src={expert.image}
                  alt={expert.name}
                />
                {expert.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-white rounded-full p-0.5">
                    <FiCheckCircle className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white">{expert.name}</span>
                  {expert.verified && (
                    <FiCheckCircle className="ml-1 h-4 w-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-xs text-gray-400">{expert.company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-700 text-center">
        <button className="text-sm font-medium text-white hover:bg-[#535353]">
          View All
        </button>
      </div>
    </div>
  );
};

export default TopExperts;
