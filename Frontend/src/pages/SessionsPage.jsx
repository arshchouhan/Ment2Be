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

  const handleJoinSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      alert('Meeting link not available. Please contact the mentor.');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user?.name || 'Student'} />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Sessions
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600">
              {filter === 'upcoming' 
                ? "You don't have any upcoming sessions."
                : filter === 'past'
                ? "You don't have any past sessions."
                : "You haven't booked any sessions yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Use SessionTimer for upcoming sessions, fallback to original layout for past sessions */}
                {filter === 'upcoming' || (['pending', 'confirmed'].includes(booking.status) && new Date(booking.sessionDate) >= new Date()) ? (
                  <div className="p-4">
                    <SessionTimer
                      session={booking}
                      onJoinSession={handleJoinSession}
                      userRole="student"
                    />
                  </div>
                ) : (
                  <div className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      {/* Left Section - Session Info */}
                      <div className="flex items-center space-x-6 flex-1">
                        {/* Mentor Avatar */}
                        <div className="flex-shrink-0">
                          {booking.mentor.profilePicture ? (
                            <img
                              src={booking.mentor.profilePicture}
                              alt={booking.mentor.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Session Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {booking.sessionTitle}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <FiUser className="w-4 h-4 mr-1" />
                              <span className="font-medium">{booking.mentor.name}</span>
                            </div>
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(booking.sessionDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <FiClock className="w-4 h-4 mr-1" />
                              <span>{booking.sessionTime} ({booking.duration} min)</span>
                            </div>
                            <div className="flex items-center">
                              <FiDollarSign className="w-4 h-4 mr-1" />
                              <span>{booking.price > 0 ? `$${booking.price}` : 'Free'}</span>
                            </div>
                          </div>

                          {/* Session Type & Topics */}
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {booking.sessionType}
                            </span>
                            {booking.topics && booking.topics.length > 0 && (
                              <>
                                {booking.topics.slice(0, 2).map((topic, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {topic}
                                  </span>
                                ))}
                                {booking.topics.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    +{booking.topics.length - 2} more
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => navigate(`/booking?bookingId=${booking._id}`)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Session Description (if available) */}
                    {booking.sessionDescription && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 line-clamp-2">{booking.sessionDescription}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => ['pending', 'confirmed'].includes(b.status) && new Date(b.sessionDate) >= new Date()).length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.duration, 0) / 60)}h
                </div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
