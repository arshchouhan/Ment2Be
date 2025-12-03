import React, { useState, useEffect } from 'react';
import { FiClock, FiVideo, FiCalendar } from 'react-icons/fi';

const SessionTimer = ({ session, onJoinSession, userRole = 'student' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update timer every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Function to get session timing info
  const getSessionTiming = (session) => {
    if (!session) {
      return { canJoin: false, message: 'No session data', timeLeft: null };
    }

    // Parse session date and time
    let sessionDateTime;
    try {
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
      
      // Extract just the date part if sessionDate is a full ISO string
      let dateString = session.sessionDate;
      if (dateString.includes('T')) {
        dateString = dateString.split('T')[0];
      }
      
      // Create the full datetime string
      const dateTimeString = `${dateString}T${timeString}`;
      sessionDateTime = new Date(dateTimeString);
      
      // Check if date is valid
      if (isNaN(sessionDateTime.getTime())) {
        return { canJoin: false, message: 'Invalid session time', timeLeft: null };
      }
    } catch (error) {
      return { canJoin: false, message: 'Error parsing time', timeLeft: null };
    }

    const now = currentTime;
    const timeDiff = sessionDateTime.getTime() - now.getTime();
    const secondsUntilSession = Math.floor(timeDiff / 1000);
    const minutesUntilSession = Math.floor(secondsUntilSession / 60);

    // Handle different statuses
    if (session.status === 'cancelled') {
      return { canJoin: false, message: 'Session cancelled', timeLeft: null };
    }

    if (session.status === 'completed') {
      return { canJoin: false, message: 'Session completed', timeLeft: null };
    }

    // For pending and confirmed sessions
    if (session.status === 'pending' || session.status === 'confirmed') {
      // Can join only if confirmed and within 5 minutes
      const canJoin = session.status === 'confirmed' && 
                     secondsUntilSession <= 300 && // 5 minutes = 300 seconds
                     secondsUntilSession >= -(session.duration * 60); // session duration in seconds

      if (canJoin) {
        if (secondsUntilSession > 0) {
          const minutes = Math.floor(secondsUntilSession / 60);
          const seconds = secondsUntilSession % 60;
          const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
          return { 
            canJoin: true, 
            message: `Starts in ${timeDisplay}`, 
            timeLeft: secondsUntilSession,
            isStartingSoon: true,
            clockDisplay: {
              days: 0,
              hours: 0,
              minutes: minutes,
              seconds: seconds
            }
          };
        } else if (secondsUntilSession >= -(session.duration * 60)) {
          const secondsIntoSession = Math.abs(secondsUntilSession);
          const remainingSeconds = (session.duration * 60) - secondsIntoSession;
          const remainingMinutes = Math.floor(remainingSeconds / 60);
          const remainingSecondsDisplay = remainingSeconds % 60;
          const timeDisplay = remainingMinutes > 0 ? `${remainingMinutes}m ${remainingSecondsDisplay}s` : `${remainingSecondsDisplay}s`;
          return { 
            canJoin: true, 
            message: `In progress (${timeDisplay} left)`, 
            timeLeft: remainingSeconds,
            isInProgress: true,
            clockDisplay: {
              days: 0,
              hours: 0,
              minutes: remainingMinutes,
              seconds: remainingSecondsDisplay
            }
          };
        }
      }

      // Show countdown for both pending and confirmed sessions
      if (secondsUntilSession > 0) {
        const daysUntil = Math.floor(secondsUntilSession / (60 * 60 * 24));
        const hoursUntil = Math.floor((secondsUntilSession % (60 * 60 * 24)) / (60 * 60));
        const minutesUntil = Math.floor((secondsUntilSession % (60 * 60)) / 60);
        const secondsRemaining = secondsUntilSession % 60;
        
        let timeMessage;
        if (daysUntil > 0) {
          timeMessage = `${daysUntil}d ${hoursUntil}h ${minutesUntil}m`;
        } else if (hoursUntil > 0) {
          timeMessage = `${hoursUntil}h ${minutesUntil}m ${secondsRemaining}s`;
        } else if (minutesUntil > 0) {
          timeMessage = `${minutesUntil}m ${secondsRemaining}s`;
        } else {
          timeMessage = `${secondsRemaining}s`;
        }

        const statusPrefix = session.status === 'pending' ? 'Pending - ' : '';
        return { 
          canJoin: false, 
          message: `${statusPrefix}Starts in ${timeMessage}`, 
          timeLeft: secondsUntilSession,
          isPending: session.status === 'pending',
          clockDisplay: {
            days: daysUntil,
            hours: hoursUntil,
            minutes: minutesUntil,
            seconds: secondsRemaining
          }
        };
      } else if (secondsUntilSession > -(session.duration * 60)) {
        // Session is currently happening
        const secondsIntoSession = Math.abs(secondsUntilSession);
        const remainingSeconds = (session.duration * 60) - secondsIntoSession;
        const remainingMinutes = Math.floor(remainingSeconds / 60);
        const remainingSecondsDisplay = remainingSeconds % 60;
        const timeDisplay = remainingMinutes > 0 ? `${remainingMinutes}m ${remainingSecondsDisplay}s` : `${remainingSecondsDisplay}s`;
        return { 
          canJoin: session.status === 'confirmed', 
          message: `In progress (${timeDisplay} left)`, 
          timeLeft: remainingSeconds,
          isInProgress: true,
          clockDisplay: {
            days: 0,
            hours: 0,
            minutes: remainingMinutes,
            seconds: remainingSecondsDisplay
          }
        };
      } else {
        // Session time has completely passed
        const secondsAgo = Math.abs(secondsUntilSession);
        const hoursAgo = Math.floor(secondsAgo / (60 * 60));
        const minutesAgo = Math.floor((secondsAgo % (60 * 60)) / 60);
        
        let timeAgoMessage;
        if (hoursAgo > 24) {
          const daysAgo = Math.floor(hoursAgo / 24);
          timeAgoMessage = `${daysAgo}d ago`;
        } else if (hoursAgo > 0) {
          timeAgoMessage = `${hoursAgo}h ${minutesAgo}m ago`;
        } else if (minutesAgo > 0) {
          timeAgoMessage = `${minutesAgo}m ago`;
        } else {
          timeAgoMessage = `${secondsAgo}s ago`;
        }
        
        return { canJoin: false, message: `Ended ${timeAgoMessage}`, timeLeft: null };
      }
    }

    return { canJoin: false, message: `Status: ${session.status}`, timeLeft: null };
  };

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
        return 'bg-green-900 text-green-300 border-green-700';
      case 'pending':
        return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'cancelled':
        return 'bg-red-900 text-red-300 border-red-700';
      case 'completed':
        return 'bg-blue-900 text-blue-300 border-blue-700';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const timing = getSessionTiming(session);

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-sm border border-gray-600 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white truncate">
          {session.sessionTitle}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-300">
          <FiCalendar className="w-4 h-4 mr-2" />
          <span>{formatDate(session.sessionDate)} at {session.sessionTime}</span>
        </div>
        <div className="flex items-center text-sm text-gray-300">
          <FiClock className="w-4 h-4 mr-2" />
          <span>{session.duration} minutes</span>
        </div>
        {userRole === 'student' && session.mentor && (
          <div className="flex items-center text-sm text-gray-300">
            <span className="font-medium">Mentor: {session.mentor.name}</span>
          </div>
        )}
        {userRole === 'mentor' && session.student && (
          <div className="flex items-center text-sm text-gray-300">
            <span className="font-medium">Student: {session.student.name}</span>
          </div>
        )}
      </div>

      {/* Compact Digital Timer Display */}
      {timing.clockDisplay ? (
        <div className="bg-[#2a2a2a] rounded-lg p-3 mb-3 font-mono border border-gray-600">
          <div className="flex items-center justify-center space-x-1 text-lg font-bold">
            {timing.clockDisplay.days > 0 && (
              <>
                <div className="text-center">
                  <div className="bg-[#404040] text-white rounded px-1.5 py-0.5 min-w-[2rem] text-sm">
                    {String(timing.clockDisplay.days).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">D</div>
                </div>
                <div className="text-gray-400 text-sm">:</div>
              </>
            )}
            
            {(timing.clockDisplay.hours > 0 || timing.clockDisplay.days > 0) && (
              <>
                <div className="text-center">
                  <div className="bg-[#404040] text-white rounded px-1.5 py-0.5 min-w-[2rem] text-sm">
                    {String(timing.clockDisplay.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">H</div>
                </div>
                <div className="text-gray-400 text-sm">:</div>
              </>
            )}
            
            <div className="text-center">
              <div className="bg-[#404040] text-white rounded px-1.5 py-0.5 min-w-[2rem] text-sm">
                {String(timing.clockDisplay.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">M</div>
            </div>
            
            <div className={`text-gray-400 text-sm ${timing.isStartingSoon || timing.isInProgress ? 'animate-pulse' : ''}`}>:</div>
            
            <div className="text-center">
              <div className={`rounded px-1.5 py-0.5 min-w-[2rem] text-sm ${
                timing.isStartingSoon || timing.isInProgress ? 'bg-red-600 text-white animate-pulse' : 'bg-[#404040] text-white'
              }`}>
                {String(timing.clockDisplay.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">S</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#2a2a2a] rounded-lg p-2 mb-3 border border-gray-600">
          <div className="text-center">
            <span className={`text-sm font-medium ${
              timing.isPending ? 'text-yellow-400' : 
              timing.isInProgress ? 'text-green-400' :
              timing.isStartingSoon ? 'text-orange-400' :
              timing.timeLeft ? 'text-[#535353]' : 'text-gray-400'
            }`}>
              {timing.message}
            </span>
          </div>
        </div>
      )}

      {/* Testing Join Button - Always Available */}
      <div className="space-y-2">
        <button
          onClick={() => onJoinSession(session)}
          className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors bg-[#535353] hover:bg-white hover:text-black text-white border border-gray-600"
        >
          <FiVideo className="w-4 h-4 mr-2" />
          Join Session (Test Mode)
        </button>
        
        {/* Timer-based Join Button */}
        {timing.canJoin && (
          <button
            onClick={() => onJoinSession(session)}
            className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors border border-gray-600 ${
              timing.isInProgress 
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-orange-700 hover:bg-orange-600 text-white'
            }`}
          >
            <FiVideo className="w-4 h-4 mr-2" />
            {timing.isInProgress ? 'Join Session (Live)' : 'Join Session (Starting Soon)'}
          </button>
        )}
      </div>

      {/* Session Description */}
      {session.sessionDescription && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <p className="text-sm text-gray-300 line-clamp-2">{session.sessionDescription}</p>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
