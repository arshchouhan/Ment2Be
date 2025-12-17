import React, { useEffect, useState } from 'react';
import SessionItem from './SessionItem';
import sessionDataService from '../../services/sessionDataService';

const SessionSidebar = ({ activeSessionId, onSessionSelect, currentSessionData, userRole }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompletedSessions();
  }, []);

  const fetchCompletedSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sessionDataService.getCompletedSessions();
      
      if (response.success) {
        setSessions(response.data || []);
      } else {
        setError('Failed to load sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session) => {
    onSessionSelect(session);
  };

  // Add current session to the list if it's not already there
  const allSessions = currentSessionData && !sessions.find(s => s._id === currentSessionData._id)
    ? [currentSessionData, ...sessions]
    : sessions;

  return (
    <div className="w-72 bg-[#0a0a0a] border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-white font-semibold text-lg">Session Journal</h3>
        <p className="text-gray-400 text-sm mt-1">Your completed mentoring sessions</p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-gray-600 border-t-gray-400 animate-spin"></div>
            <p className="text-gray-400 text-sm mt-2">Loading sessions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-sm">{error}</p>
            <button 
              onClick={fetchCompletedSessions}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : allSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No completed sessions yet</p>
            <p className="text-gray-500 text-xs mt-1">Complete a mentoring session to see it here</p>
          </div>
        ) : (
          <>
            {allSessions.map((session) => (
              <SessionItem
                key={session._id || session.id}
                session={session}
                userRole={userRole}
                isActive={activeSessionId === (session._id || session.id)}
                onClick={() => handleSessionClick(session)}
                hasNotes={session.hasNotes || false}
                hasAIAnalysis={session.hasAIAnalysis || false}
              />
            ))}
          </>
        )}
      </div>

      </div>
  );
};

export default SessionSidebar;
