import React, { useState, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiVideo,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiMail,
  FiBook,
} from 'react-icons/fi';

export const EnhancedStudentCard = ({
  student,
  sessions = [],
  onJoinSession,
  onConfirmSession,
  onRejectSession,
  onCancelSession,
  formatDate,
}) => {
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showKarmaAnimation, setShowKarmaAnimation] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastProgress, setToastProgress] = useState(100);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle confirm with karma animation
  const handleConfirmWithKarma = (session) => {
    setShowKarmaAnimation(true);
    onConfirmSession(session);
    // Hide animation after 2 seconds
    setTimeout(() => {
      setShowKarmaAnimation(false);
    }, 2000);
  };

  // Handle join session with toast notification
  const handleJoinClick = (session) => {
    const timing = getSessionTiming(session);
    if (!timing.canJoin) {
      setToastMessage(`Session is not available yet. You can join on ${formatDate(session.sessionDate)} at ${session.sessionTime}`);
      setShowToast(true);
      setToastProgress(100);
      
      // Animate progress bar over 4 seconds
      const interval = setInterval(() => {
        setToastProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 0.5; // 100 / 200 = 0.5 per 20ms for smooth animation
        });
      }, 20);
      
      setTimeout(() => {
        setShowToast(false);
        clearInterval(interval);
      }, 4000);
      return;
    }
    onJoinSession(session);
  };

  // Sort sessions: upcoming first, then by date
  const sortedSessions = [...sessions].sort((a, b) => {
    const now = new Date();
    const dateA = new Date(a.sessionDate);
    const dateB = new Date(b.sessionDate);
    
    const isAUpcoming = dateA >= now && ['pending', 'confirmed'].includes(a.status);
    const isBUpcoming = dateB >= now && ['pending', 'confirmed'].includes(b.status);
    
    if (isAUpcoming && isBUpcoming) return dateA - dateB;
    if (isAUpcoming && !isBUpcoming) return -1;
    if (!isAUpcoming && isBUpcoming) return 1;
    return dateB - dateA;
  });

  const selectedSession = sortedSessions[selectedSessionIndex];

  // Get session timing info
  const getSessionTiming = (session) => {
    if (!session) return { canJoin: false, message: 'No session data', timeLeft: null };

    try {
      let timeString = session.sessionTime;
      
      if (timeString && (timeString.includes('AM') || timeString.includes('PM'))) {
        const parts = timeString.trim().split(' ');
        if (parts.length === 2) {
          const [time, period] = parts;
          const timeParts = time.split(':');
          if (timeParts.length >= 2) {
            let hours = parseInt(timeParts[0]);
            let minutes = parseInt(timeParts[1]) || 0;
            
            if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
            else if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
            
            timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
          }
        }
      }
      
      let dateString = session.sessionDate;
      if (dateString.includes('T')) dateString = dateString.split('T')[0];
      
      const sessionDateTime = new Date(`${dateString}T${timeString}`);
      if (isNaN(sessionDateTime.getTime())) {
        return { canJoin: false, message: 'Invalid time', timeLeft: null };
      }

      const now = currentTime;
      const timeDiff = sessionDateTime.getTime() - now.getTime();
      const minutesUntilSession = Math.floor(timeDiff / (1000 * 60));

      if (session.status === 'cancelled') {
        return { canJoin: false, message: 'Cancelled', timeLeft: null, statusColor: 'text-gray-400' };
      }

      if (session.status === 'completed') {
        return { canJoin: false, message: 'Completed', timeLeft: null, statusColor: 'text-blue-400' };
      }

      if (session.status === 'pending' || session.status === 'confirmed') {
        const canJoin = session.status === 'confirmed' && 
                       minutesUntilSession <= 5 && 
                       minutesUntilSession >= -session.duration;

        if (canJoin) {
          if (minutesUntilSession > 0) {
            return { 
              canJoin: true, 
              message: `Starts in ${minutesUntilSession}m`, 
              timeLeft: minutesUntilSession,
              statusColor: 'text-indigo-400',
              isStartingSoon: true
            };
          } else {
            const minutesIntoSession = Math.abs(minutesUntilSession);
            return { 
              canJoin: true, 
              message: `In progress (${minutesIntoSession}m)`, 
              timeLeft: session.duration - minutesIntoSession,
              statusColor: 'text-indigo-400',
              isInProgress: true
            };
          }
        }

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
            timeMessage = `${minutesUntilSession}m`;
          }

          const statusPrefix = session.status === 'pending' ? 'Pending - ' : '';
          return { 
            canJoin: false, 
            message: `${statusPrefix}${timeMessage}`, 
            timeLeft: minutesUntilSession,
            statusColor: session.status === 'pending' ? 'text-purple-400' : 'text-blue-400',
            isPending: session.status === 'pending'
          };
        }
      }

      return { canJoin: false, message: `Status: ${session.status}`, timeLeft: null, statusColor: 'text-gray-400' };
    } catch (error) {
      return { canJoin: false, message: 'Error', timeLeft: null, statusColor: 'text-gray-400' };
    }
  };

  const timing = getSessionTiming(selectedSession);

  const getStatusBadge = (status, sessionDate) => {
    // Check if session is expired (past date and not completed)
    const isExpired = new Date(sessionDate) < new Date() && status !== 'completed' && status !== 'cancelled';
    const displayStatus = isExpired ? 'expired' : status;
    
    const badges = {
      pending: { icon: FiAlertCircle, text: 'Pending' },
      confirmed: { icon: FiCheckCircle, text: 'Confirmed' },
      completed: { icon: FiCheckCircle, text: 'Completed' },
      cancelled: { icon: FiXCircle, text: 'Cancelled' },
      expired: { icon: FiAlertCircle, text: 'Expired' },
    };
    const badge = badges[displayStatus] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white">
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const upcomingSessions = sessions.filter(s => {
    const date = new Date(s.sessionDate);
    return date >= new Date() && ['pending', 'confirmed'].includes(s.status);
  }).length;
  const totalHours = Math.round(sessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.duration, 0) / 60);

  return (
    <div className="bg-[#121212] border border-gray-700 rounded-xl overflow-visible shadow-lg relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a] text-gray-300 border border-gray-700 rounded-lg shadow-lg z-50 max-w-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-white flex-shrink-0" />
            <span className="text-sm">{toastMessage}</span>
          </div>
          <div className="h-1 bg-gray-700">
            <div 
              className="h-full bg-gray-500 transition-all duration-100"
              style={{ width: `${toastProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Karma Animation */}
      {showKarmaAnimation && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50">
          <div className="animate-bounce text-3xl font-bold text-indigo-400 drop-shadow-lg">
            +1 karma
          </div>
        </div>
      )}

      {/* Student Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#121212] p-6 border-b border-gray-700">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            {student.profilePicture ? (
              <img
                src={student.profilePicture}
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-600">
                {student.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-[#121212]"></div>
          </div>

          {/* Student Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{student.name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <FiMail className="w-3 h-3 text-white" />
                {student.email}
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-xs">
                <FiBook className="w-3 h-3 text-white" />
                <span className="text-white font-semibold">{totalSessions}</span>
                <span className="text-gray-400">Total</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <FiCheckCircle className="w-3 h-3 text-white" />
                <span className="text-white font-semibold">{completedSessions}</span>
                <span className="text-gray-400">Done</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <FiClock className="w-3 h-3 text-white" />
                <span className="text-white font-semibold">{upcomingSessions}</span>
                <span className="text-gray-400">Upcoming</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <FiClock className="w-3 h-3 text-white" />
                <span className="text-white font-semibold">{totalHours}h</span>
                <span className="text-gray-400">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Selector */}
      <div className="p-4 bg-[#1a1a1a] border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-400">Select Session ({totalSessions} total)</span>
          <button
            onClick={() => setShowAllSessions(!showAllSessions)}
            className="text-xs text-white hover:text-white flex items-center gap-1"
          >
            {showAllSessions ? (
              <>Hide All <FiChevronUp className="w-3 h-3 text-white" /></>
            ) : (
              <>Show All <FiChevronDown className="w-3 h-3 text-white" /></>
            )}
          </button>
        </div>

        {/* Session Pills */}
        <div className={`flex flex-wrap gap-2 ${showAllSessions ? '' : 'max-h-20 overflow-hidden'}`}>
          {sortedSessions.map((session, index) => {
            const sessionTiming = getSessionTiming(session);
            return (
              <button
                key={session._id}
                onClick={() => setSelectedSessionIndex(index)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedSessionIndex === index
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-[#121212] text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-3 h-3" />
                  <span>{new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    new Date(session.sessionDate) < new Date() && session.status !== 'completed' && session.status !== 'cancelled' ? 'bg-gray-500' :
                    session.status === 'confirmed' ? 'bg-white' :
                    session.status === 'pending' ? 'bg-white' :
                    session.status === 'completed' ? 'bg-white' : 'bg-gray-400'
                  }`}></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Session Details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Session Details</h4>
          {getStatusBadge(selectedSession.status, selectedSession.sessionDate)}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <FiBook className="w-4 h-4 text-white" />
            <span className="text-gray-400">Topic:</span>
            <span className="text-white font-medium">{selectedSession.sessionTitle || 'Mentoring Session'}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <FiCalendar className="w-4 h-4 text-white" />
            <span className="text-gray-400">Date:</span>
            <span className="text-white font-medium">{formatDate(selectedSession.sessionDate)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <FiClock className="w-4 h-4 text-white" />
            <span className="text-gray-400">Time:</span>
            <span className="text-white font-medium">{selectedSession.sessionTime} ({selectedSession.duration} min)</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <FiMapPin className="w-4 h-4 text-white" />
            <span className="text-gray-400">Location:</span>
            <span className="text-white font-medium">{selectedSession.location || 'Online'}</span>
          </div>

          {/* Status and Countdown */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <FiClock className="w-4 h-4 text-white" />
              <span className="text-gray-400">Status:</span>
              {getStatusBadge(selectedSession.status, selectedSession.sessionDate)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {selectedSession.status === 'pending' && (
            <>
              {new Date(selectedSession.sessionDate) < new Date() ? (
                <button
                  disabled
                  className="flex-1 bg-[#1a1a1a] text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiAlertCircle className="w-4 h-4" />
                  Session has expired
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleConfirmWithKarma(selectedSession)}
                    className="flex-1 bg-[#2a2d32] hover:bg-[#3a3d42] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Confirm
                  </button>
                  <button
                    onClick={() => onRejectSession(selectedSession)}
                    className="flex-1 bg-[#2a2d32] hover:bg-[#3a3d42] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FiXCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
            </>
          )}

          {selectedSession.status === 'confirmed' && (
            <>
              <button
                onClick={() => handleJoinClick(selectedSession)}
                className="flex-1 bg-[#2a2d32] hover:bg-[#3a3d42] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FiVideo className="w-4 h-4" />
                Join the Session on {formatDate(selectedSession.sessionDate)} at {selectedSession.sessionTime}
              </button>
              <button
                onClick={() => onCancelSession(selectedSession)}
                className="px-4 py-2 bg-[#2a2d32] hover:bg-[#3a3d42] text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {selectedSession.status === 'completed' && (
            <button
              disabled
              className="flex-1 bg-gray-700 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
            >
              Session Completed
            </button>
          )}

          {selectedSession.status === 'cancelled' && (
            <button
              disabled
              className="flex-1 bg-gray-700 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
            >
              Session Cancelled
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
