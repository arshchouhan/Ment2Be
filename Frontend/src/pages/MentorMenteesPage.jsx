import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiDollarSign, FiEye, FiMapPin, FiRefreshCw, FiMessageSquare, FiVideo, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MentorNavbar from '../components/MentorDashboard/Navbar';
import { StudentSessionCard } from '../components/MentorDashboard/StudentSessionCard';

const MentorMenteesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const fetchMentorBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:4000/api/bookings/mentor', {
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
        // Bookings are already filtered for the current mentor on the backend
        setBookings(data.bookings);
      } else {
        setError('No bookings data received');
      }
    } catch (err) {
      console.error('Error fetching mentor bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorBookings();
  }, [navigate, location.pathname]);

  // Timer effect to update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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

  // Function to get session timing info
  const getSessionTiming = (session) => {
    if (!session) {
      return { canJoin: false, message: 'No session data', timeLeft: null };
    }

    // Parse session date and time more carefully
    let sessionDateTime;
    try {
      // Debug: Log the raw session data
      console.log('Session data:', {
        date: session.sessionDate,
        time: session.sessionTime,
        status: session.status
      });

      // Handle different time formats (e.g., "2:00 PM" vs "14:00")
      let timeString = session.sessionTime;
      
      // Convert 12-hour format to 24-hour format if needed
      if (timeString && (timeString.includes('AM') || timeString.includes('PM'))) {
        const parts = timeString.trim().split(' ');
        if (parts.length === 2) {
          const [time, period] = parts;
          const timeParts = time.split(':');
          if (timeParts.length >= 2) {
            let hours = parseInt(timeParts[0]);
            let minutes = parseInt(timeParts[1]) || 0;
            
            if (period.toUpperCase() === 'PM' && hours !== 12) {
              hours += 12;
            } else if (period.toUpperCase() === 'AM' && hours === 12) {
              hours = 0;
            }
            
            timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
          }
        }
      }
      
      console.log('Converted time string:', timeString);
      
      // Extract just the date part if sessionDate is a full ISO string
      let dateString = session.sessionDate;
      if (dateString.includes('T')) {
        dateString = dateString.split('T')[0]; // Get just the YYYY-MM-DD part
      }
      
      // Create the full datetime string
      const dateTimeString = `${dateString}T${timeString}`;
      console.log('Full datetime string:', dateTimeString);
      
      sessionDateTime = new Date(dateTimeString);
      
      // Check if date is valid
      if (isNaN(sessionDateTime.getTime())) {
        console.error('Invalid session date/time:', session.sessionDate, session.sessionTime, 'Converted:', timeString);
        return { canJoin: false, message: 'Invalid session time', timeLeft: null };
      }
      
      console.log('Parsed session datetime:', sessionDateTime);
    } catch (error) {
      console.error('Error parsing session date/time:', error, session);
      return { canJoin: false, message: 'Error parsing time', timeLeft: null };
    }

    const now = currentTime;
    const timeDiff = sessionDateTime.getTime() - now.getTime();
    const minutesUntilSession = Math.floor(timeDiff / (1000 * 60));
    
    // Debug: Log time calculations
    console.log('Time calculations:', {
      sessionDateTime: sessionDateTime.toISOString(),
      currentTime: now.toISOString(),
      timeDiff: timeDiff,
      minutesUntilSession: minutesUntilSession
    });

    // Handle different statuses
    if (session.status === 'cancelled') {
      return { canJoin: false, message: 'Session cancelled', timeLeft: null };
    }

    if (session.status === 'completed') {
      return { canJoin: false, message: 'Session completed', timeLeft: null };
    }

    // For pending and confirmed sessions, show timer
    if (session.status === 'pending' || session.status === 'confirmed') {
      // Can join only if confirmed and within 5 minutes
      const canJoin = session.status === 'confirmed' && 
                     minutesUntilSession <= 5 && 
                     minutesUntilSession >= -session.duration;

      if (canJoin) {
        if (minutesUntilSession > 0) {
          return { 
            canJoin: true, 
            message: `Starts in ${minutesUntilSession} min`, 
            timeLeft: minutesUntilSession,
            isStartingSoon: true
          };
        } else if (minutesUntilSession >= -session.duration) {
          const minutesIntoSession = Math.abs(minutesUntilSession);
          return { 
            canJoin: true, 
            message: `In progress (${minutesIntoSession} min)`, 
            timeLeft: session.duration - minutesIntoSession,
            isInProgress: true
          };
        }
      }

      // Show countdown for both pending and confirmed sessions
      if (minutesUntilSession > 0) {
        const hoursUntil = Math.floor(minutesUntilSession / 60);
        const remainingMinutes = minutesUntilSession % 60;
        const daysUntil = Math.floor(minutesUntilSession / (60 * 24));
        
        let timeMessage;
        if (daysUntil > 0) {
          timeMessage = `${daysUntil}d ${Math.floor((minutesUntilSession % (60 * 24)) / 60)}h`;
        } else if (hoursUntil > 0) {
          timeMessage = `${hoursUntil}h ${remainingMinutes}m`;
        } else {
          timeMessage = `${minutesUntilSession} min`;
        }

        const statusPrefix = session.status === 'pending' ? 'Pending - ' : '';
        return { 
          canJoin: false, 
          message: `${statusPrefix}Starts in ${timeMessage}`, 
          timeLeft: minutesUntilSession,
          isPending: session.status === 'pending'
        };
      } else if (minutesUntilSession > -session.duration) {
        // Session is currently happening
        const minutesIntoSession = Math.abs(minutesUntilSession);
        const remainingMinutes = session.duration - minutesIntoSession;
        return { 
          canJoin: session.status === 'confirmed', 
          message: `In progress (${remainingMinutes} min left)`, 
          timeLeft: remainingMinutes,
          isInProgress: true
        };
      } else {
        // Session time has completely passed
        const hoursAgo = Math.floor(Math.abs(minutesUntilSession) / 60);
        const minutesAgo = Math.abs(minutesUntilSession) % 60;
        
        let timeAgoMessage;
        if (hoursAgo > 24) {
          const daysAgo = Math.floor(hoursAgo / 24);
          timeAgoMessage = `${daysAgo}d ago`;
        } else if (hoursAgo > 0) {
          timeAgoMessage = `${hoursAgo}h ${minutesAgo}m ago`;
        } else {
          timeAgoMessage = `${minutesAgo}m ago`;
        }
        
        return { canJoin: false, message: `Ended ${timeAgoMessage}`, timeLeft: null };
      }
    }

    return { canJoin: false, message: `Status: ${session.status}`, timeLeft: null };
  };

  // Function to handle joining session with ZegoCloud
  const handleJoinSession = async (session) => {
    try {
      console.log('Attempting to join ZegoCloud session:', session);
      
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      if (!user) {
        alert('Please log in to join the session.');
        return;
      }

      // Check if session has required properties
      if (!session._id) {
        alert('Invalid session data. Please refresh the page and try again.');
        return;
      }

      // Generate room ID for ZegoCloud (use session ID as room ID)
      const roomId = session.roomId || `session_${session._id}`;
      const sessionId = session._id;
      const userRole = 'mentor'; // Since this is mentor mentees page

      console.log('ZegoCloud meeting details:', {
        roomId,
        sessionId,
        userRole,
        userName: user.name
      });

      // Open ZegoCloud meeting page
      const meetingUrl = `/meeting?roomId=${roomId}&sessionId=${sessionId}&userRole=${userRole}`;
      console.log('Opening ZegoCloud meeting URL:', meetingUrl);
      window.open(meetingUrl, '_blank');

    } catch (error) {
      console.error('Error joining ZegoCloud session:', error);
      alert(`Error joining session: ${error.message}. Please try again.`);
    }
  };

  // Function to confirm pending session
  const handleConfirmSession = async (session) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to confirm the session.');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/bookings/${session._id}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Session confirmed successfully! Student has been notified.');
        // Refresh the bookings to update the UI
        fetchMentorBookings();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to confirm session. Please try again.');
      }
    } catch (error) {
      console.error('Error confirming session:', error);
      alert('Error confirming session. Please check your connection and try again.');
    }
  };

  // Function to reject pending session
  const handleRejectSession = async (session) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to reject the session.');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/bookings/${session._id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Session rejected. Student has been notified.');
        // Refresh the bookings to update the UI
        fetchMentorBookings();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to reject session. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting session:', error);
      alert('Error rejecting session. Please check your connection and try again.');
    }
  };

  // Function to cancel confirmed session
  const handleCancelSession = async (session) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to cancel the session.');
        return;
      }

      if (confirm('Are you sure you want to cancel this session? The student will be notified.')) {
        const response = await fetch(`http://localhost:4000/api/bookings/${session._id}/cancel`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          alert('Session cancelled. Student has been notified.');
          // Refresh the bookings to update the UI
          fetchMentorBookings();
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to cancel session. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      alert('Error cancelling session. Please check your connection and try again.');
    }
  };

  // Navigation functions for session carousel
  const nextSession = () => {
    const sessions = getActiveSessions();
    if (currentSessionIndex < sessions.length - 1) {
      setCurrentSessionIndex(currentSessionIndex + 1);
    }
  };

  const prevSession = () => {
    if (currentSessionIndex > 0) {
      setCurrentSessionIndex(currentSessionIndex - 1);
    }
  };

  // Reset index when mentees change
  useEffect(() => {
    setCurrentSessionIndex(0);
  }, [bookings]);

  // Handle session expiration
  const handleSessionExpired = (sessionId) => {
    // Update the session status in the local state
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking._id === sessionId ? { ...booking, status: 'expired' } : booking
      )
    );
  };

  // Process individual sessions for carousel display
  const getActiveSessions = () => {
    // Get all sessions and sort by date (upcoming first, then recent)
    const now = new Date();
    
    return bookings
      .filter(booking => ['pending', 'confirmed', 'completed'].includes(booking.status))
      .map(booking => {
        // Calculate session stats for this student across all their bookings
        const studentBookings = bookings.filter(b => b.student._id === booking.student._id);
        const totalSessions = studentBookings.length;
        const completedSessions = studentBookings.filter(b => b.status === 'completed').length;
        const totalHours = studentBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.duration, 0);
        const firstSession = studentBookings
          .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))[0];

        return {
          student: booking.student,
          sessions: studentBookings,
          totalSessions,
          completedSessions,
          upcomingSessions: studentBookings.filter(b => 
            new Date(b.sessionDate) >= now && ['pending', 'confirmed'].includes(b.status)
          ).length,
          totalHours,
          latestSession: booking, // This session itself
          firstSession
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.latestSession.sessionDate);
        const dateB = new Date(b.latestSession.sessionDate);
        
        // Sort upcoming sessions first (by date ascending), then past sessions (by date descending)
        const isAUpcoming = dateA >= now && ['pending', 'confirmed'].includes(a.latestSession.status);
        const isBUpcoming = dateB >= now && ['pending', 'confirmed'].includes(b.latestSession.status);
        
        if (isAUpcoming && isBUpcoming) {
          return dateA - dateB; // Upcoming: earliest first
        } else if (isAUpcoming && !isBUpcoming) {
          return -1; // A is upcoming, B is past
        } else if (!isAUpcoming && isBUpcoming) {
          return 1; // B is upcoming, A is past
        } else {
          return dateB - dateA; // Both past: most recent first
        }
      });
  };

  // Process unique mentees from bookings (for stats)
  const getMentees = () => {
    const menteesMap = new Map();
    
    bookings.forEach(booking => {
      const studentId = booking.student._id;
      if (!menteesMap.has(studentId)) {
        menteesMap.set(studentId, {
          student: booking.student,
          sessions: [],
          totalSessions: 0,
          completedSessions: 0,
          upcomingSessions: 0,
          totalHours: 0,
          latestSession: null,
          firstSession: null
        });
      }
      
      const mentee = menteesMap.get(studentId);
      mentee.sessions.push(booking);
      mentee.totalSessions++;
      
      if (booking.status === 'completed') {
        mentee.completedSessions++;
        mentee.totalHours += booking.duration;
      }
      
      const sessionDate = new Date(booking.sessionDate);
      const now = new Date();
      if (sessionDate >= now && ['pending', 'confirmed'].includes(booking.status)) {
        mentee.upcomingSessions++;
      }
      
      // Track latest and first sessions - prioritize upcoming confirmed sessions
      const bookingDate = new Date(booking.sessionDate);
      
      // For latest session, prioritize upcoming confirmed sessions, then most recent
      if (!mentee.latestSession) {
        mentee.latestSession = booking;
      } else {
        const currentLatestDate = new Date(mentee.latestSession.sessionDate);
        const isCurrentUpcoming = currentLatestDate >= now && mentee.latestSession.status === 'confirmed';
        const isBookingUpcoming = bookingDate >= now && booking.status === 'confirmed';
        
        if (isBookingUpcoming && !isCurrentUpcoming) {
          // Prioritize upcoming confirmed sessions
          mentee.latestSession = booking;
        } else if (isBookingUpcoming && isCurrentUpcoming && bookingDate < currentLatestDate) {
          // Among upcoming sessions, choose the soonest
          mentee.latestSession = booking;
        } else if (!isCurrentUpcoming && !isBookingUpcoming && bookingDate > currentLatestDate) {
          // Among past sessions, choose the most recent
          mentee.latestSession = booking;
        }
      }
      
      if (!mentee.firstSession || bookingDate < new Date(mentee.firstSession.sessionDate)) {
        mentee.firstSession = booking;
      }
    });
    
    return Array.from(menteesMap.values()).sort((a, b) => 
      new Date(b.latestSession?.sessionDate || 0) - new Date(a.latestSession?.sessionDate || 0)
    );
  };

  const mentees = getMentees();
  const activeSessions = getActiveSessions();

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-14">
        <MentorNavbar userName={user?.name || 'Mentor'} />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading mentee sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-14">
      <MentorNavbar userName={user?.name || 'Mentor'} />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Mentees</h1>
              <p className="text-[#b3b3b3] text-lg">Manage your mentoring sessions and track student progress</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#121212] border border-gray-700 rounded-lg px-4 py-2 shadow-lg">
                <span className="text-sm text-[#535353]">Active Mentees</span>
                <div className="text-2xl font-bold text-white">{mentees.length}</div>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-black border border-red-500 rounded-xl p-6 shadow-lg">
            <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5" />
              Error
            </h3>
            <p className="text-[#b3b3b3]">{error}</p>
          </div>
        ) : mentees.length === 0 ? (
          <div className="bg-black border border-gray-700 rounded-xl p-12 text-center shadow-lg">
            <div className="bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-10 h-10 text-[#535353]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No mentees yet</h3>
            <p className="text-[#b3b3b3] mb-6">You haven't received any session bookings yet. Start by promoting your mentoring services!</p>
            <button className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              View Profile
            </button>
          </div>
        ) : (
            <div className="space-y-8">
              {/* Quick Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{mentees.length}</div>
                      <div className="text-[10px] text-[#535353]">Total Mentees</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-lg font-bold text-white">{bookings.length}</div>
                      <div className="text-[10px] text-[#535353]">Total Sessions</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="text-lg font-bold text-white">
                        {bookings.filter(b => b.status === 'completed').length}
                      </div>
                      <div className="text-[10px] text-[#535353]">Completed</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121212] border border-gray-700 rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-lg font-bold text-white">
                        {Math.round(bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.duration, 0) / 60)}h
                      </div>
                      <div className="text-[10px] text-[#535353]">Total Hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Mentoring Sessions */}
                <div className="col-span-12 lg:col-span-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Active Sessions</h2>
                      <p className="text-[#b3b3b3]">Manage your ongoing mentoring relationships</p>
                    </div>
                    {/* Navigation arrows - only show if more than 2 sessions */}
                    {activeSessions.length > 2 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={prevSession}
                          disabled={currentSessionIndex === 0}
                          className={`p-2 rounded-lg border transition-colors ${
                            currentSessionIndex === 0
                              ? 'border-[#404040] text-[#535353] cursor-not-allowed'
                              : 'border-[#404040] text-white hover:bg-[#2a2d32] hover:border-white'
                          }`}
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-[#b3b3b3] px-2">
                          {currentSessionIndex + 1} - {Math.min(currentSessionIndex + 2, activeSessions.length)} of {activeSessions.length}
                        </span>
                        <button
                          onClick={nextSession}
                          disabled={currentSessionIndex >= activeSessions.length - 2}
                          className={`p-2 rounded-lg border transition-colors ${
                            currentSessionIndex >= activeSessions.length - 2
                              ? 'border-[#404040] text-[#535353] cursor-not-allowed'
                              : 'border-[#404040] text-white hover:bg-[#2a2d32] hover:border-white'
                          }`}
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Sessions Display */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {activeSessions.slice(currentSessionIndex, currentSessionIndex + 2).map((session, index) => (
                      <StudentSessionCard
                        key={`${session.student._id}-${session.latestSession._id}-${index}`}
                        studentName={session.student.name}
                        studentEmail={session.student.email}
                        studentAvatar={session.student.profilePicture}
                        courseName={session.latestSession?.sessionTitle || 'N/A'}
                        courseCode={session.latestSession?.course?.courseCode || 'N/A'}
                        sessionDate={session.latestSession ? formatDate(session.latestSession.sessionDate) : 'N/A'}
                        sessionTime={session.latestSession?.sessionTime || 'N/A'}
                        duration={`${session.latestSession?.duration || 0} min`}
                        location={session.latestSession?.location || 'Online'}
                        status={session.latestSession?.status || 'completed'}
                        sessionType={session.latestSession?.sessionType || 'online'}
                        totalSessions={session.totalSessions}
                        completedSessions={session.completedSessions}
                        cancelledSessions={session.sessions.filter(s => s.status === 'cancelled').length}
                        missedSessions={session.sessions.filter(s => s.status === 'missed').length}
                        totalHoursStudied={Math.round(session.totalHours / 60)}
                        sessionHistory={session.sessions}
                        enrollmentDate={session.firstSession ? formatDate(session.firstSession.sessionDate) : 'N/A'}
                        latestSession={session.latestSession}
                        onJoinSession={handleJoinSession}
                        onConfirmSession={handleConfirmSession}
                        onRejectSession={handleRejectSession}
                        onCancelSession={handleCancelSession}
                        onSessionExpired={handleSessionExpired}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column - Enhanced Summary & Quick Actions */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Performance Overview */}
                  <div className="bg-[#121212] border border-gray-700 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FiTrendingUp className="w-5 h-5 text-green-400" />
                      Performance Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[#b3b3b3]">Completion Rate</span>
                        <span className="text-white font-semibold">
                          {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-[#202327] rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{width: `${bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) : 0}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#b3b3b3]">Avg Session Duration</span>
                        <span className="text-white font-semibold">
                          {bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + b.duration, 0) / bookings.length) : 0} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-[#121212] border border-gray-700 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        Schedule New Session
                      </button>
                      <button className="w-full bg-[#202327] border border-[#404040] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#2a2d32] transition-colors flex items-center gap-2">
                        <FiMessageSquare className="w-4 h-4" />
                        Send Bulk Message
                      </button>
                      <button className="w-full bg-[#202327] border border-[#404040] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#2a2d32] transition-colors flex items-center gap-2">
                        <FiEye className="w-4 h-4" />
                        View All Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MentorMenteesPage;
