import React from 'react';
import { FiStar, FiCalendar, FiUsers, FiAward } from 'react-icons/fi';

const ProfileContent = ({ mentorData, activeTab }) => {
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Pinned Repositories Style - Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Pinned</h3>
          <button className="text-sm text-blue-400 hover:text-blue-300">Customize your pins</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Session Card 1 */}
          <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 hover:bg-[#252525] transition-colors duration-200 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer text-base">
                    React Advanced Patterns
                  </h4>
                  <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">Ongoing</span>
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  Master advanced React patterns including compound components, render props, and state management with Context API and Redux.
                </p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-xs text-gray-400">
                    <FiCalendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>Next session: Today, 4:00 PM</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <FiUsers className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>3/5 participants registered</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#333] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                      Interactive
                    </span>
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      90 min
                    </span>
                  </div>
                  <button className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors">
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Session Card 2 */}
          <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 hover:bg-[#252525] transition-colors duration-200 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer text-base">
                    Node.js Backend Mastery
                  </h4>
                  <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">Upcoming</span>
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  Learn to build scalable, high-performance backend services with Node.js, Express, and MongoDB.
                </p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-xs text-gray-400">
                    <FiCalendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>Scheduled: Dec 10, 3:00 PM</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <FiUsers className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>8/10 participants registered</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#333] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      Hands-on
                    </span>
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      120 min
                    </span>
                  </div>
                  <button className="text-xs font-medium bg-[#333] hover:bg-[#3d3d3d] text-gray-200 px-3 py-1 rounded-md transition-colors">
                    Register
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Session Card 3 */}
          <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 hover:bg-[#252525] transition-colors duration-200 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer text-base">
                    System Design Workshop
                  </h4>
                  <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded-full">Waitlist</span>
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  Design and architect large-scale distributed systems. Learn about load balancing, caching, and database scaling.
                </p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-xs text-gray-400">
                    <FiCalendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>Starts: Jan 5, 10:00 AM</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <FiUsers className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>15/15 participants (3 on waitlist)</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#333] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      Workshop
                    </span>
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      180 min
                    </span>
                  </div>
                  <button className="text-xs font-medium bg-[#333] hover:bg-[#3d3d3d] text-gray-200 px-3 py-1 rounded-md transition-colors">
                    Join Waitlist
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Session Card 4 */}
          <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 hover:bg-[#252525] transition-colors duration-200 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer text-base">
                    Data Structures & Algorithms
                  </h4>
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Self-Paced</span>
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  Master essential data structures and algorithms with hands-on coding exercises and real-world problem-solving.
                </p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-xs text-gray-400">
                    <FiCalendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>Start anytime • 8-week program</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <FiUsers className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>24/7 community support</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#333] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      Self-Paced
                    </span>
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      Certificate
                    </span>
                  </div>
                  <button className="text-xs font-medium bg-[#333] hover:bg-[#3d3d3d] text-gray-200 px-3 py-1 rounded-md transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Session Card 5 - Career Guidance */}
          <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 hover:bg-[#252525] transition-colors duration-200 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer text-base">
                    Career Guidance Sessions
                  </h4>
                  <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">Popular</span>
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  Get expert guidance on tech career roadmaps, resume building, and interview preparation.
                </p>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-xs text-gray-400">
                    <FiCalendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>Weekly sessions • 60 min each</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <FiUsers className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    <span>12/15 participants registered</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#333] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      Career
                    </span>
                    <span className="px-2 py-0.5 bg-[#2d2d2d] text-gray-300 text-xs rounded-full">
                      60 min
                    </span>
                  </div>
                  <button className="text-xs font-medium bg-[#333] hover:bg-[#3d3d3d] text-gray-200 px-3 py-1 rounded-md transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = (title) => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No {title} Available</h3>
        <p className="text-sm text-gray-400">There's nothing to show right now</p>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-4">
      {renderEmptyState('Reviews')}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-4">
      {renderEmptyState('Achievements')}
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-4">
      {renderEmptyState('Group Sessions')}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'reviews':
        return renderReviews();
      case 'achievements':
        return renderAchievements();
      case 'sessions':
        return renderSessions();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="bg-[#121212] border border-[#333] rounded-lg p-6">
      {renderContent()}
    </div>
  );
};

export default ProfileContent;
