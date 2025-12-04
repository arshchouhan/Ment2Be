import React from 'react';
import { FiUser, FiUsers } from 'react-icons/fi';

const UserProfileCard = ({ user }) => {
  return (
    <div className="bg-[#121212] rounded-lg border border-gray-700 overflow-hidden h-[120px] flex flex-col">
 
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <FiUser className="h-5 w-5 text-gray-300" />
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'Guest User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              @{user?.username || 'username'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-between text-center">
          <div>
            <p className="text-lg font-bold text-white">0</p>
            <p className="text-xs text-gray-400">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">0</p>
            <p className="text-xs text-gray-400">Following</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserProfileCard;
