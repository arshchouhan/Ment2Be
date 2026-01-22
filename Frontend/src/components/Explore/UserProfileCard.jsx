import React, { useState, useEffect } from 'react';
import { FiUser, FiUsers } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/backendConfig';

const UserProfileCard = ({ user }) => {
  const [connectedMentorsCount, setConnectedMentorsCount] = useState(0);
  const [connectedMentorsLoading, setConnectedMentorsLoading] = useState(true);

  useEffect(() => {
    const fetchConnectedMentorsCount = async () => {
      try {
        setConnectedMentorsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/connections/my-connections?status=connected`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setConnectedMentorsCount(data.count || 0);
        }
      } catch (err) {
        console.error('Error fetching connected mentors count:', err);
        setConnectedMentorsCount(0);
      } finally {
        setConnectedMentorsLoading(false);
      }
    };

    fetchConnectedMentorsCount();
  }, []);

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-[#121212] rounded-lg border border-gray-700 overflow-hidden h-[120px] flex flex-col">
 
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-gray-300">{getInitials(user?.name)}</span>
            )}
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'Guest User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              @{user?.name?.toLowerCase().replace(/\s+/g, '') || 'username'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-center text-center">
          <div>
            <p className="text-lg font-bold text-white">{connectedMentorsLoading ? '...' : connectedMentorsCount}</p>
            <p className="text-xs text-gray-400">Connections</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserProfileCard;
