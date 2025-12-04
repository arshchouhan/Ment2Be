import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiBookOpen, FiTrendingUp, FiUserPlus } from 'react-icons/fi';
import Navbar from '../components/StudentDashboard/Navbar';
import SessionTimer from '../components/SessionTimer';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        const res = await fetch("http://localhost:4000/api/user/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setProfile(data.user);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
    fetchUpcomingSessions();
  }, [navigate]);

  const fetchUpcomingSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSessionsLoading(true);
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.bookings) {
        // Filter for upcoming sessions (confirmed or pending)
        const upcoming = data.bookings.filter(booking => {
          const sessionDate = new Date(booking.sessionDate);
          const now = new Date();
          return sessionDate >= now && ['pending', 'confirmed'].includes(booking.status);
        }).sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
        
        setUpcomingSessions(upcoming.slice(0, 1)); // Show only next 1 session
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleJoinSession = async (session) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to join the session');
        return;
      }

      // Call the join session API to get room details
      const response = await fetch(`http://localhost:4000/api/bookings/${session._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Open meeting room in new window/tab with room details
        const meetingUrl = `/meeting?roomId=${data.data.roomId}&sessionId=${data.data.sessionId}&userRole=${data.data.userRole}`;
        window.open(meetingUrl, '_blank', 'width=1200,height=800');
      } else {
        alert(data.message || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
    }
  };

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "";

  const joinedLabel = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  if (loading)
    return (
      <div className="min-h-screen bg-[#202327] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    );

  return (
    <div className="h-screen bg-[#202327] text-white overflow-hidden">
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        /* Webkit Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #121212;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #535353;
          border-radius: 4px;
          border: 1px solid #202327;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        ::-webkit-scrollbar-corner {
          background: #121212;
        }
        
        /* Firefox Scrollbar Styling */
        * {
          scrollbar-width: thin;
          scrollbar-color: #535353 #121212;
        }
        
        /* Custom scrollbar for specific containers */
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #535353 #121212;
        }
        
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scroll::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 3px;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 3px;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #505050;
        }
      `}</style>

      <Navbar userName={profile?.name || 'Student'} />
      
      <div className="grid grid-cols-12 gap-2 p-4 h-full">
        {/* LEFT COLUMN - Profile Card */}
        <aside className="col-span-2 bg-[#121212] rounded-xl p-6 border border-gray-700 h-fit">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Profile Photo - Fixed width container */}
            <div className="relative w-40 h-40">
              <div className="w-full h-full rounded-lg bg-gray-700 overflow-hidden border-4 border-gray-600 flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-gray-300">
                  {initials || ""}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">{profile?.name}</h2>
              <p className="text-gray-400 text-sm">{profile?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="w-full space-y-2 mt-8">
              <button
                onClick={() => navigate('/student/explore')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-[#212121] rounded-lg transition-colors"
              >
                <FiUser className="w-4 h-4" />
                <span>Find Mentors</span>
              </button>
              
              <button
                onClick={() => navigate('/student/sessions')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-[#212121] rounded-lg transition-colors"
              >
                <FiCalendar className="w-4 h-4" />
                <span>My Sessions</span>
              </button>
              
              <button
                onClick={() => navigate('/student/journal')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-300 hover:bg-[#212121] rounded-lg transition-colors"
              >
                <FiBookOpen className="w-4 h-4" />
                <span>Learning Journal</span>
              </button>
            </div>

            {/* Join Date */}
            <div className="w-full border-t border-gray-600 pt-4 text-center">
              <p className="text-gray-500 text-xs">Joined {joinedLabel}</p>
            </div>
          </div>
        </aside>

        {/* MIDDLE COLUMN - Main Content */}
        <main className="col-span-7 space-y-2 overflow-y-auto custom-scroll max-h-full">
          {/* Welcome Header */}
          <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.name || 'Student'}!
            </h1>
            <p className="text-gray-400">Here's what's happening with your learning journey.</p>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-xl p-4">
              <p className="text-red-400">Error: {error}</p>
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FiCalendar className="w-5 h-5 mr-2" />
                Next Session
              </h2>
              <button
                onClick={() => navigate('/student/sessions')}
                className="text-[#535353] hover:text-white text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            {sessionsLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-400">Loading sessions...</p>
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session._id} className="bg-[#202327] rounded-lg p-4">
                    <SessionTimer
                      session={session}
                      onJoinSession={handleJoinSession}
                      userRole="student"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCalendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No upcoming sessions</h3>
                <p className="text-gray-400 mb-4">Book a session with a mentor to get started!</p>
                <button
                  onClick={() => navigate('/student/explore')}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FiUser className="w-4 h-4 mr-2" />
                  Find Mentors
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/student/explore')}
                className="bg-[#202327] rounded-lg p-4 text-left hover:bg-[#2a2d32] transition-colors border border-gray-700 h-full"
              >
                <div className="flex items-center">
                  <div className="bg-gray-700 rounded-lg p-2 mr-3">
                    <FiUser className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Find Mentors</h3>
                    <p className="text-gray-400 text-xs mt-1">Browse and connect with expert mentors</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/student/sessions')}
                className="bg-[#202327] rounded-lg p-4 text-left hover:bg-[#2a2d32] transition-colors border border-gray-700 h-full"
              >
                <div className="flex items-center">
                  <div className="bg-gray-700 rounded-lg p-2 mr-3">
                    <FiCalendar className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">My Sessions</h3>
                    <p className="text-gray-400 text-xs mt-1">View all your booked sessions</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/student/journal')}
                className="bg-[#202327] rounded-lg p-4 text-left hover:bg-[#2a2d32] transition-colors border border-gray-700 h-full"
              >
                <div className="flex items-center">
                  <div className="bg-gray-700 rounded-lg p-2 mr-3">
                    <FiBookOpen className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Learning Journal</h3>
                    <p className="text-gray-400 text-xs mt-1">Track your progress and insights</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/student/chat')}
                className="bg-[#202327] rounded-lg p-4 text-left hover:bg-[#2a2d32] transition-colors border border-gray-700 h-full"
              >
                <div className="flex items-center">
                  <div className="bg-gray-700 rounded-lg p-2 mr-3">
                    <FiTrendingUp className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Messages</h3>
                    <p className="text-gray-400 text-xs mt-1">Chat with your mentors</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN - Profile & Stats */}
        <aside className="col-span-3 space-y-6 overflow-y-auto custom-scroll max-h-full">
          {/* Profile Card */}
          {profile && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Your Profile</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <FiUser className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{profile.name}</p>
                    <p className="text-sm text-gray-400">{profile.email}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                    {profile.role}
                  </span>
                  {(!profile.bio || !profile.skills?.length) && (
                    <button
                      onClick={() => navigate('/student/profile')}
                      className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <FiUserPlus className="w-4 h-4 mr-2" />
                      Complete Your Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Learning Stats */}
          <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Learning Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Sessions</span>
                <span className="font-semibold text-white">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Hours Learned</span>
                <span className="font-semibold text-white">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Mentors Connected</span>
                <span className="font-semibold text-white">-</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => navigate('/student/sessions')}
                className="w-full text-center text-[#535353] hover:text-white text-sm font-medium"
              >
                View Detailed Stats
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UserDashboard;