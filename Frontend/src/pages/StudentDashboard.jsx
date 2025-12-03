import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiBookOpen, FiTrendingUp } from 'react-icons/fi';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={profile?.name || 'Student'} />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || 'Student'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your learning journey.</p>
        </div>

        {loading && <p className="text-gray-600">Loading your profile...</p>}
        
        {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">Error: {error}</p>}

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upcoming Sessions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Next Session</h2>
                <button
                  onClick={() => navigate('/student/sessions')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {sessionsLoading ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <p className="text-gray-500">Loading sessions...</p>
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <SessionTimer
                      key={session._id}
                      session={session}
                      onJoinSession={handleJoinSession}
                      userRole="student"
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                  <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
                  <p className="text-gray-600 mb-4">Book a session with a mentor to get started!</p>
                  <button
                    onClick={() => navigate('/student/explore')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiUser className="w-4 h-4 mr-2" />
                    Find Mentors
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/student/explore')}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-3 mr-4">
                      <FiUser className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Find Mentors</h3>
                      <p className="text-gray-600 text-sm">Browse and connect with expert mentors</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/student/sessions')}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-lg p-3 mr-4">
                      <FiCalendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">My Sessions</h3>
                      <p className="text-gray-600 text-sm">View all your booked sessions</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/student/journal')}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-lg p-3 mr-4">
                      <FiBookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Learning Journal</h3>
                      <p className="text-gray-600 text-sm">Track your progress and insights</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/student/chat')}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-lg p-3 mr-4">
                      <FiTrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                      <p className="text-gray-600 text-sm">Chat with your mentors</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile & Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            {profile && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <FiUser className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{profile.name}</p>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Learning Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hours Learned</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mentors Connected</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate('/student/sessions')}
                  className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Detailed Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
