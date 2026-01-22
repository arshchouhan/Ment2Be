import React, { useState, useEffect } from 'react';
import { FiMapPin, FiLinkedin, FiGithub, FiEdit, FiStar, FiAward, FiClock, FiUsers } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/backendConfig';

const ProfileHeader = ({ mentorData, isOwnProfile = false, mentorId }) => {
  const [mentorStats, setMentorStats] = useState({
    mentoredStudents: 0,
    totalSessions: 0,
    rating: 0,
    reviewCount: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const fetchMentorStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !mentorId) return;

        console.log('🔍 [ProfileHeader] Fetching stats for mentor:', mentorId);

        // Fetch mentor stats using the correct endpoint
        const statsResponse = await fetch(`${API_BASE_URL}/bookings/mentor/stats?mentorId=${mentorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const statsData = await statsResponse.json();
        
        let mentoredStudents = 0;
        let completedSessions = 0;

        if (statsResponse.ok && statsData.success && statsData.data) {
          mentoredStudents = statsData.data.sessionsCompleted || 0;
          completedSessions = statsData.data.sessionsCompleted || 0;
          console.log('✅ [ProfileHeader] Stats from backend:', { mentoredStudents, completedSessions });
        }

        // Fetch reviews for this mentor to calculate rating
        const reviewsResponse = await fetch(`${API_BASE_URL}/reviews?mentorId=${mentorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const reviewsData = await reviewsResponse.json();
        
        let averageRating = 0;
        let reviewCount = 0;

        if (reviewsResponse.ok && reviewsData.success && reviewsData.reviews) {
          // Filter reviews with ratings
          const ratedReviews = reviewsData.reviews.filter(review => review.rating);
          reviewCount = ratedReviews.length;
          
          if (reviewCount > 0) {
            const totalRating = ratedReviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = (totalRating / reviewCount).toFixed(1);
          }
          console.log('⭐ [ProfileHeader] Reviews:', { reviewCount, averageRating });
        }

        setMentorStats({
          mentoredStudents,
          totalSessions: completedSessions,
          rating: parseFloat(averageRating),
          reviewCount
        });

        console.log('📊 [ProfileHeader] Final mentor stats:', { mentoredStudents, completedSessions, averageRating, reviewCount });
      } catch (err) {
        console.error('Error fetching mentor stats:', err);
      }
    };

    fetchMentorStats();
  }, [mentorId]);

  // Check if already connected
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !mentorId) return;

        const response = await fetch(`${API_BASE_URL}/connections/check?mentorId=${mentorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setIsConnected(data.isConnected);
          console.log('🔗 [ProfileHeader] Connection status:', data.isConnected);
        }
      } catch (err) {
        console.error('Error checking connection status:', err);
      }
    };

    checkConnectionStatus();
  }, [mentorId]);

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !mentorId) {
        console.error('Missing token or mentorId');
        return;
      }

      setIsConnecting(true);
      console.log('🔗 [ProfileHeader] Connecting to mentor:', mentorId);

      const response = await fetch(`${API_BASE_URL}/connections/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mentorId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ [ProfileHeader] Successfully connected to mentor');
        setIsConnected(true);
        alert('Successfully connected to mentor!');
      } else {
        console.error('❌ [ProfileHeader] Connection failed:', data.message);
        alert(data.message || 'Failed to connect to mentor');
      }
    } catch (err) {
      console.error('Error connecting to mentor:', err);
      alert('Error connecting to mentor');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !mentorId) {
        console.error('Missing token or mentorId');
        return;
      }

      setIsConnecting(true);
      console.log('🔗 [ProfileHeader] Disconnecting from mentor:', mentorId);

      const response = await fetch(`${API_BASE_URL}/connections/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mentorId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ [ProfileHeader] Successfully disconnected from mentor');
        setIsConnected(false);
        alert('Successfully disconnected from mentor');
      } else {
        console.error('❌ [ProfileHeader] Disconnection failed:', data.message);
        alert(data.message || 'Failed to disconnect from mentor');
      }
    } catch (err) {
      console.error('Error disconnecting from mentor:', err);
      alert('Error disconnecting from mentor');
    } finally {
      setIsConnecting(false);
    }
  };
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
                      <FiStar className="h-4 w-4 text-white mr-1" />
                      <span className="text-white font-medium">{mentorStats.rating || '0.0'}</span>
                      <span className="text-gray-400 text-sm ml-1">({mentorStats.reviewCount} reviews)</span>
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
                    <FiUsers className="h-4 w-4 mr-1.5 text-white" />
                    <span>Mentored {mentorStats.mentoredStudents || 0} students</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <FiClock className="h-4 w-4 mr-1.5 text-white" />
                    <span>{mentorStats.totalSessions || 0} sessions</span>
                  </div>
                  {mentorData.stats?.isTopMentor && (
                    <div className="flex items-center text-white bg-[#2d2d2d] px-2 py-0.5 rounded-full border border-[#444]">
                      <FiAward className="h-3.5 w-3.5 mr-1 text-white" />
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
                    <FiMapPin className="h-4 w-4 mr-1.5 text-white" />
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
                ) : isConnected ? (
                  <button 
                    onClick={handleDisconnect}
                    disabled={isConnecting}
                    className="inline-flex justify-center items-center px-4 py-2 border border-[#444] rounded-md text-sm font-medium text-white bg-[#2d2d2d] hover:bg-[#3d3d3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                ) : (
                  <button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="inline-flex justify-center items-center px-4 py-2 border border-[#444] rounded-md text-sm font-medium text-white bg-[#2d2d2d] hover:bg-[#3d3d3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
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
