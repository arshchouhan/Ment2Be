import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiDollarSign, FiEye, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import Navbar from '../components/StudentDashboard/Navbar';
import SessionTimer from '../components/SessionTimer';

const SessionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  const handleJoinSession = async (session) => {
    try {
      console.log('Attempting to join session:', session);
      
      // For ZegoCloud meetings
      if (session.meetingType === 'zegocloud' || (session.meetingLink && session.meetingLink.includes('zegocloud'))) {
        const roomId = session.meetingId || session.roomId || session.meetingLink?.split('/').pop();
        if (roomId) {
          const meetingUrl = `/meeting-zego?roomId=${encodeURIComponent(roomId)}&sessionId=${session._id}`;
          console.log('Opening ZegoCloud meeting:', meetingUrl);
          window.open(meetingUrl, '_blank');
          return;
        }
      }
      
      // For Zoom meetings
      if (session.meetingLink && session.meetingLink.includes('zoom.us')) {
        if (session.meetingLink.includes('?') || session.meetingLink.includes('/j/')) {
          console.log('Opening Zoom meeting with direct link');
          window.open(session.meetingLink, '_blank');
        } else if (session.meetingId) {
          const zoomUrl = `https://zoom.us/j/${session.meetingId}${session.passcode ? `?pwd=${session.passcode}` : ''}`;
          console.log('Opening Zoom meeting with ID:', zoomUrl);
          window.open(zoomUrl, '_blank');
        } else {
          console.log('Opening Zoom meeting with basic link');
          window.open(session.meetingLink, '_blank');
        }
        return;
      }
      
      // For direct meeting links
      if (session.meetingLink) {
        console.log('Opening direct meeting link');
        window.open(session.meetingLink, '_blank');
        return;
      }
      
      // For meeting ID only
      const roomId = session.meetingId || session.roomId;
      if (roomId) {
        const meetingUrl = `/meeting?roomId=${encodeURIComponent(roomId)}&sessionId=${session._id}`;
        console.log('Opening default meeting room:', meetingUrl);
        window.open(meetingUrl, '_blank');
        return;
      }
      
      // If we get here, we couldn't determine how to join
      console.error('Could not join meeting - missing required parameters. Session data:', {
        meetingType: session.meetingType,
        meetingLink: session.meetingLink,
        meetingId: session.meetingId,
        roomId: session.roomId,
        sessionId: session._id,
        sessionDate: session.sessionDate,
        status: session.status
      });
      
      // Check if this is a session that should have a meeting link
      const sessionDate = session.sessionDate ? new Date(session.sessionDate) : null;
      const now = new Date();
      
      if (!sessionDate) {
        alert('This session does not have a scheduled date. Please contact the mentor for assistance.');
      } else if ((sessionDate - now) > (24 * 60 * 60 * 1000)) {
        alert('This session is more than 24 hours away. The meeting link will be available closer to the session time.');
      } else if (sessionDate > now) {
        alert('The meeting link is not available yet. Please check back closer to your session time or contact the mentor.');
      } else {
        alert('Unable to join the meeting. Please contact the mentor for assistance.');
      }
    } catch (error) {
      console.error('Error joining meeting:', error, 'Session data:', session);
      alert('An error occurred while trying to join the meeting. Please try again or contact support.');
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      if (data.success && data.bookings) {
        setBookings(data.bookings);
      } else {
        setError('No bookings data received');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate, location.pathname]); // Refetch when navigating to this page

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const sessionDate = new Date(booking.sessionDate);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return sessionDate >= now && ['pending', 'confirmed'].includes(booking.status);
    } else if (filter === 'past') {
      return sessionDate < now || ['completed', 'cancelled'].includes(booking.status);
    }
    return true; // all
  });

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userName={user?.name || 'Student'} />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading bookings...</div>
        </div>
      </div>
    );
  }

  // Categorize bookings
  const completedSessions = bookings.filter(booking => booking.status === 'completed');
  const upcomingSessions = bookings.filter(booking => 
    ['scheduled', 'confirmed', 'pending'].includes(booking.status) && 
    new Date(booking.sessionDate) >= new Date()
  );
  const cancelledSessions = bookings.filter(booking => booking.status === 'cancelled');

  const SessionCard = ({ booking }) => {
    return (
      <div className="bg-[#121212] rounded-lg p-4 border border-gray-700 mb-3 hover:border-white transition-colors">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
              <FiUser className="h-5 w-5 text-gray-300" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">
              {booking.mentor?.name || 'Mentor Name'}
            </h4>
            <p className="text-xs text-gray-400">{booking.mentor?.title || 'Mentor'}</p>
            
            <div className="mt-2 flex items-center text-xs text-gray-400">
              <FiCalendar className="mr-1 h-3 w-3" />
              {new Date(booking.sessionDate).toLocaleDateString()}
              <span className="mx-1">•</span>
              <FiClock className="mr-1 h-3 w-3" />
              {new Date(booking.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                booking.status === 'completed' 
                  ? 'bg-[#2c2c2c] text-gray-300 border border-gray-600' 
                  : booking.status === 'cancelled' 
                    ? 'bg-[#2c2c2c] text-gray-400 border border-gray-600'
                    : 'bg-[#2c2c2c] text-white border border-gray-600'
              }`}>
                {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Scheduled'}
              </span>
            </div>
          </div>
        </div>
        
        {!['completed', 'cancelled'].includes(booking.status) && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <button
              onClick={() => handleJoinSession(booking)}
              className="w-full py-2 px-3 bg-white hover:bg-gray-200 text-gray-900 text-xs font-medium rounded transition-colors"
            >
              Join Session
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pt-14">
      <Navbar userName={user?.name || 'Student'} />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Sessions</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your mentoring sessions</p>
        </div>

        {error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-2 px-4 py-2 bg-gray-800 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 flex items-center mx-auto"
            >
              <FiRefreshCw className="mr-2" /> Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-hidden">
            {/* Upcoming Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Upcoming</h2>
                <span className="text-xs bg-[#2c2c2c] text-gray-300 px-2 py-1 rounded-full">
                  {upcomingSessions.length} sessions
                </span>
              </div>
              <div className="space-y-3">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map(booking => (
                    <SessionCard key={booking._id} booking={booking} />
                  ))
                ) : (
                  <div className="bg-[#121212] rounded-lg p-6 border border-dashed border-gray-700 text-center">
                    <FiCalendar className="mx-auto h-8 w-8 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-400">No upcoming sessions</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Completed Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Completed</h2>
                <span className="text-xs bg-[#2c2c2c] text-gray-300 px-2 py-1 rounded-full">
                  {completedSessions.length} sessions
                </span>
              </div>
              <div className="space-y-3">
                {completedSessions.length > 0 ? (
                  completedSessions.map(booking => (
                    <SessionCard key={booking._id} booking={booking} />
                  ))
                ) : (
                  <div className="bg-[#121212] rounded-lg p-6 border border-dashed border-gray-700 text-center">
                    <FiCalendar className="mx-auto h-8 w-8 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-400">No completed sessions</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Cancelled Sessions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Cancelled</h2>
                <span className="text-xs bg-[#2c2c2c] text-gray-300 px-2 py-1 rounded-full">
                  {cancelledSessions.length} sessions
                </span>
              </div>
              <div className="space-y-3">
                {cancelledSessions.length > 0 ? (
                  cancelledSessions.map(booking => (
                    <SessionCard key={booking._id} booking={booking} />
                  ))
                ) : (
                  <div className="bg-[#121212] rounded-lg p-6 border border-dashed border-gray-700 text-center">
                    <FiCalendar className="mx-auto h-8 w-8 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-400">No cancelled sessions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
