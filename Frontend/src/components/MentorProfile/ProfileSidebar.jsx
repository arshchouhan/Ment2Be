import React, { useState, useEffect } from 'react';
import { FiStar, FiUsers, FiClock, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/backendConfig';

const ProfileSidebar = ({ mentorData, onBookSession, mentorId }) => {
  const [stats, setStats] = useState({
    sessionsCompleted: 0,
    totalMentoringTime: '0 mins',
    karmaPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [earliestSlot, setEarliestSlot] = useState(null);

  useEffect(() => {
    const fetchMentorStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token || !mentorId) {
          setLoading(false);
          return;
        }

        // Fetch mentor stats from backend (includes actual mentoring time calculation)
        const statsResponse = await fetch(`${API_BASE_URL}/bookings/mentor/stats?mentorId=${mentorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const statsData = await statsResponse.json();
        
        if (statsResponse.ok && statsData.success) {
          console.log('📊 [ProfileSidebar] Backend stats:', statsData.data);

          setStats({
            sessionsCompleted: statsData.data.sessionsCompleted,
            totalMentoringTime: statsData.data.totalMentoringTime,
            karmaPoints: statsData.data.karmaPoints || 0
          });

          console.log('✅ [ProfileSidebar] Stats updated:', {
            sessionsCompleted: statsData.data.sessionsCompleted,
            totalMentoringTime: statsData.data.totalMentoringTime,
            karmaPoints: statsData.data.karmaPoints
          });
        }
      } catch (err) {
        console.error('Error fetching mentor stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorStats();
  }, [mentorId]);

  useEffect(() => {
    const fetchEarliestSlot = async () => {
      try {
        if (!mentorId) return;

        const normalizedApiBase = (API_BASE_URL && API_BASE_URL.includes('8081'))
          ? null
          : API_BASE_URL;

        const baseUrls = [
          'https://k23dx.onrender.com',
          normalizedApiBase
        ].filter(Boolean);

        const tryFetchSlot = async (url) => {
          try {
            const response = await fetch(url);
            let data = null;
            try {
              data = await response.json();
            } catch {
              data = null;
            }
            return { response, data };
          } catch {
            return { response: null, data: null };
          }
        };

        const formatSlot = (date, startTime) => {
          if (!date || !startTime) return null;
          const dateObj = new Date(date);
          const formattedDate = Number.isNaN(dateObj.getTime())
            ? date
            : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `${formattedDate} • ${startTime}`;
        };

        for (const baseUrl of baseUrls) {
          // 1) Prefer the proper "next" endpoint (earliest upcoming slot)
          const nextUrl = `${baseUrl}/api/mentor-availability/next/${mentorId}`;
          const nextRes = await tryFetchSlot(nextUrl);

          if (nextRes.response?.ok && nextRes.data?.success && nextRes.data?.data?.date && nextRes.data?.data?.startTime) {
            setEarliestSlot(formatSlot(nextRes.data.data.date, nextRes.data.data.startTime));
            console.log('[Availability] Using', nextUrl);
            return;
          }

          // 2) Fallback: older deployments may only have /latest
          const latestUrl = `${baseUrl}/api/mentor-availability/latest/${mentorId}`;
          const latestRes = await tryFetchSlot(latestUrl);

          const date = latestRes.data?.data?.date;
          const slots = latestRes.data?.data?.timeSlots;
          const firstUnbooked = Array.isArray(slots)
            ? slots.find((slot) => slot && slot.isBooked !== true)
            : null;

          if (latestRes.response?.ok && latestRes.data?.success && date && firstUnbooked?.startTime) {
            setEarliestSlot(formatSlot(date, firstUnbooked.startTime));
            console.log('[Availability] Using', latestUrl);
            return;
          }
        }

        setEarliestSlot(null);
      } catch (err) {
        setEarliestSlot(null);
      }
    };

    fetchEarliestSlot();
  }, [mentorId]);

  return (
    <div className="space-y-6">
      {/* Achievements/Stats Card */}
      <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-6">
        <h3 className="text-base font-semibold text-white mb-4">Achievements</h3>
        
        <div className="space-y-4">
          {/* Rating */}
          <div className="flex items-center">
            <FiStar className="h-5 w-5 text-white mr-3" />
            <div>
              <div className="font-semibold text-white">{mentorData.rating.toFixed(1)}/5.0</div>
              <div className="text-sm text-gray-400">Rating ({mentorData.reviews} reviews)</div>
            </div>
          </div>

          {/* Sessions completed */}
          <div className="flex items-center">
            <FiUsers className="h-5 w-5 text-white mr-3" />
            <div>
              <div className="font-semibold text-white">{loading ? '...' : stats.sessionsCompleted}</div>
              <div className="text-sm text-gray-400">Sessions completed</div>
            </div>
          </div>

          {/* Total mentoring time */}
          <div className="flex items-center">
            <FiClock className="h-5 w-5 text-white mr-3" />
            <div>
              <div className="font-semibold text-white">{loading ? '...' : stats.totalMentoringTime}</div>
              <div className="text-sm text-gray-400">Total mentoring time</div>
            </div>
          </div>

          {/* Karma Points */}
          <div className="flex items-center">
            <FiTrendingUp className="h-5 w-5 text-white mr-3" />
            <div>
              <div className="font-semibold text-white">{loading ? '...' : stats.karmaPoints}</div>
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
              {mentorData?.hourlyRate > 0 ? `$${mentorData.hourlyRate}` : 'Free'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Response Time:</span>
            <span className="font-medium text-white">Within 2 hours</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Availability:</span>
            <span className="font-medium text-white">{earliestSlot ? earliestSlot : 'Not set'}</span>
          </div>
        </div>

        <button 
          onClick={onBookSession}
          className="w-full bg-[#202327] text-white py-2.5 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium flex items-center justify-center border border-white"
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
