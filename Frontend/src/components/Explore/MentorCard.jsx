import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiGift } from 'react-icons/fi';

const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();
  const [mentorStats, setMentorStats] = useState({
    mentoredStudents: 0,
    totalSessions: 0
  });

  useEffect(() => {
    const fetchMentorStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !mentor.id) {
          console.log('⚠️ [MentorCard] Missing token or mentor.id:', { hasToken: !!token, mentorId: mentor.id });
          return;
        }

        console.log('🔍 [MentorCard] Fetching stats for mentor:', mentor.id, 'Name:', mentor.name);

        // Fetch mentor stats using the correct endpoint
        const url = `http://localhost:4000/api/bookings/mentor/stats?mentorId=${mentor.id}`;
        console.log('📍 [MentorCard] API URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('📊 [MentorCard] API Response:', { status: response.status, success: data.success, sessionsCompleted: data.data?.sessionsCompleted });
        
        if (response.ok && data.success && data.data) {
          console.log('✅ [MentorCard] Stats for', mentor.name, ':', { 
            mentoredStudents: data.data.sessionsCompleted,
            totalSessions: data.data.sessionsCompleted
          });

          setMentorStats({
            mentoredStudents: data.data.sessionsCompleted || 0,
            totalSessions: data.data.sessionsCompleted || 0
          });
        }
      } catch (err) {
        console.error('❌ [MentorCard] Error fetching mentor stats:', err);
      }
    };

    fetchMentorStats();
  }, [mentor.id]);

  const handleCardClick = () => {
    navigate(`/mentor-profile?mentor=${encodeURIComponent(mentor.name)}&mentorId=${mentor.id}`);
  };

  return (
    <div 
      className="bg-[#121212] rounded-lg border border-gray-700 overflow-hidden hover:border-white transition-all duration-300 cursor-pointer w-full"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start">
          {/* Mentor Image */}
          <div className="relative mr-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
              {mentor.image ? (
                <img
                  className="h-20 w-20 rounded-full object-cover"
                  src={mentor.image}
                  alt={mentor.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <span 
                style={{ display: mentor.image ? 'none' : 'flex' }}
                className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg"
              >
                {mentor.name?.charAt(0).toUpperCase() || 'M'}
              </span>
            </div>
            {mentor.isOnline && (
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Mentor Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                <p className="text-sm text-white">{mentor.title}</p>
                <p className="text-sm text-gray-400">{mentor.companies}</p>
                <p className="text-xs text-gray-500 mt-1">{mentor.experience}</p>
              </div>
              <div className="flex items-center bg-[#535353] text-white text-sm font-medium px-2 py-1 rounded">
                <FiStar className="text-white mr-1" />
                {Number(mentor.rating || mentor.averageRating || 0).toFixed(1)} ({mentor.ratedCount || mentor.totalReviews || 0})
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-300 line-clamp-2">{mentor.bio}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#535353] text-white border-cyan-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Mentor Stats */}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-300">
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>Mentored {mentorStats.mentoredStudents} students</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⏱️</span>
                <span>{mentorStats.totalSessions} sessions</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button className="flex items-center gap-1 px-3 py-1 bg-[#535353] hover:bg-[#6b7280] text-white rounded text-xs font-medium transition-colors">
                <FiGift className="text-white" size={14} />
                <span>Free Trial</span>
              </button>
              <div className="text-lg font-bold text-[#535353]">
                ${mentor.price}<span className="text-sm font-normal text-gray-400">/{mentor.priceUnit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorCard;
