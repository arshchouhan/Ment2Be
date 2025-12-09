import React from 'react';
import { FiMapPin, FiLinkedin, FiGithub, FiEdit, FiStar, FiAward, FiClock, FiUsers } from 'react-icons/fi';

const ProfileHeader = ({ mentorData, isOwnProfile = false }) => {
  return (
    <div className="bg-[#1f1f1f] border border-[#333] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
          {/* Profile Image */}
          <div className="flex-shrink-0 relative">
            {mentorData.profileImage ? (
              <img
                className="h-32 w-32 rounded-full border-4 border-[#333] object-cover hover:border-gray-500 transition-all duration-300"
                src={mentorData.profileImage}
                alt={mentorData.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`h-32 w-32 rounded-full border-4 border-[#333] bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center ${mentorData.profileImage ? 'hidden' : 'flex'}`}
              style={{ display: mentorData.profileImage ? 'none' : 'flex' }}
            >
              <span className="text-4xl font-bold text-gray-300">
                {mentorData.name?.charAt(0).toUpperCase() || 'M'}
              </span>
            </div>
            
            {/* Experience Badge */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-md">
              {mentorData.experience || '5+'} years experience
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0 w-full">
              <div className="flex-1">
                <div className="flex flex-col space-y-2">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{mentorData.name || 'Mentor Name'}</h1>
                    <p className="text-lg text-gray-400 mt-1">{mentorData.title || 'Mentor'}</p>
                    <p className="text-sm text-gray-400 mt-1">{mentorData.company || 'Company Name'}</p>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center">
                    <div className="flex items-center bg-[#2d2d2d] px-3 py-1 rounded-full">
                      <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-white font-medium">{mentorData.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-gray-400 text-sm ml-1">({mentorData.reviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                
                {/* Bio */}
                <div className="mt-4">
                  <p className="text-gray-300 leading-relaxed">
                    {mentorData.bio || 'Experienced mentor passionate about sharing knowledge and helping others grow in their careers.'}
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center text-gray-300">
                    <FiUsers className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span>Mentored {mentorData.stats?.mentoredStudents || '100+'}+ students</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <FiClock className="h-4 w-4 mr-1.5 text-green-400" />
                    <span>{mentorData.stats?.totalSessions || '200+'}+ sessions</span>
                  </div>
                  {mentorData.stats?.isTopMentor && (
                    <div className="flex items-center text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full">
                      <FiAward className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs font-medium">Top Mentor</span>
                    </div>
                  )}
                </div>
                
                {/* Skills */}
                {mentorData.skills?.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {mentorData.skills.slice(0, 5).map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-[#2d2d2d] text-gray-300 text-xs rounded-full hover:bg-[#3d3d3d] transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                      {mentorData.skills.length > 5 && (
                        <span className="px-3 py-1 bg-[#2d2d2d] text-gray-500 text-xs rounded-full">
                          +{mentorData.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Location and Social Links */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center text-gray-300">
                    <FiMapPin className="h-4 w-4 mr-1.5 text-red-400" />
                    <span className="text-sm">{mentorData.location || 'Remote'}</span>
                  </div>
                  
                  {mentorData.socialLinks?.linkedin && (
                    <a 
                      href={mentorData.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-400 hover:text-gray-300 text-sm transition-colors"
                      aria-label="LinkedIn profile"
                    >
                      <FiLinkedin className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">LinkedIn</span>
                    </a>
                  )}
                  
                  {mentorData.socialLinks?.github && (
                    <a 
                      href={mentorData.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-400 hover:text-gray-300 text-sm transition-colors"
                      aria-label="GitHub profile"
                    >
                      <FiGithub className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">GitHub</span>
                    </a>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col justify-start md:justify-end">
                {isOwnProfile ? (
                  <button className="inline-flex justify-center items-center px-4 py-2 border border-[#444] rounded-md text-sm font-medium text-white bg-[#2d2d2d] hover:bg-[#333] transition-colors">
                    <FiEdit className="h-4 w-4 mr-2" />
                    Edit profile
                  </button>
                ) : (
                  <button className="inline-flex justify-center items-center px-4 py-2 border border-[#444] rounded-md text-sm font-medium text-white bg-[#2d2d2d] hover:bg-[#3d3d3d] transition-colors">
                    Follow
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
