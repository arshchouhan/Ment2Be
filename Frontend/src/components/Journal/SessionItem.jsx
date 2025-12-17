import React from 'react';

const SessionItem = ({ session, userRole, isActive, onClick, hasNotes, hasAIAnalysis }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const mentorName = session.mentorName || session.mentor?.name;
  const studentName = session.studentName || session.student?.name;
  const counterpartName = userRole === 'mentor' ? (studentName || 'Student') : (mentorName || 'Mentor');

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
        isActive 
          ? 'bg-[#333333] border-gray-500' 
          : 'bg-[#1a1a1a] border-gray-700 hover:bg-[#2a2a2a] hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">
            Session with {counterpartName}
          </h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-400 text-xs">
              {formatDate(session.sessionDate)}
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs">
              {formatTime(session.sessionTime)}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-gray-500 text-xs">
              {session.duration || 60} min
            </span>
            {session.topic && (
              <>
                <span className="text-gray-500 text-xs">•</span>
                <span className="text-gray-300 text-xs truncate max-w-[100px]">
                  {session.topic}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1 ml-2">
          {hasNotes && (
            <div className="w-2 h-2 rounded-full bg-gray-400" title="Notes Saved"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionItem;
