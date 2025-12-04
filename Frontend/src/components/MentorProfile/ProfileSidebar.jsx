import React from 'react';
import { FiStar, FiUsers, FiClock, FiTrendingUp, FiCalendar } from 'react-icons/fi';

const ProfileSidebar = ({ mentorData, onBookSession }) => {
  return (
    <div className="space-y-6">
      {/* Achievements/Stats Card */}
      <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-6">
        <h3 className="text-base font-semibold text-white mb-4">Achievements</h3>
        
        <div className="space-y-4">
          {/* Rating */}
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100/10 rounded-lg mr-3">
              <FiStar className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="font-semibold text-white">{mentorData.rating}/5.0</div>
              <div className="text-sm text-gray-400">Rating ({mentorData.reviews} reviews)</div>
            </div>
          </div>

          {/* Sessions completed */}
          <div className="flex items-center">
            <div className="p-2 bg-blue-100/10 rounded-lg mr-3">
              <FiUsers className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-white">{mentorData.stats.sessionsCompleted}</div>
              <div className="text-sm text-gray-400">Sessions completed</div>
            </div>
          </div>

          {/* Total mentoring time */}
          <div className="flex items-center">
            <div className="p-2 bg-green-100/10 rounded-lg mr-3">
              <FiClock className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="font-semibold text-white">{mentorData.stats.totalMentoringTime}</div>
              <div className="text-sm text-gray-400">Total mentoring time</div>
            </div>
          </div>

          {/* Karma Points */}
          <div className="flex items-center">
            <div className="p-2 bg-purple-100/10 rounded-lg mr-3">
              <FiTrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="font-semibold text-white">{mentorData.stats.karmaPoints}</div>
              <div className="text-sm text-gray-400">Karma Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Card */}
      <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-6">
        <h3 className="text-base font-semibold text-white mb-4">Skills & Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {mentorData.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#333] text-gray-200 border border-[#444]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Book Session Card */}
      <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-6">
        <h3 className="text-base font-semibold text-white mb-4">Book a Session</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Hourly Rate:</span>
            <span className="font-medium text-white">
              {mentorData.hourlyRate > 0 ? `$${mentorData.hourlyRate}` : 'Free'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Response Time:</span>
            <span className="font-medium text-white">Within 2 hours</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Availability:</span>
            <span className="font-medium text-green-400">Available now</span>
          </div>
        </div>

        <button 
          onClick={onBookSession}
          className="w-full bg-green-600 text-white py-2.5 px-4 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
        >
          <FiCalendar className="h-4 w-4 mr-2" />
          Book Session
        </button>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Usually responds within 2 hours
        </p>
      </div>
    </div>
  );
};

export default ProfileSidebar;
