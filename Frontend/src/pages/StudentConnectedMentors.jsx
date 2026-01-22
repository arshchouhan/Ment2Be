import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMail, FiPhone, FiLinkedin, FiGithub } from 'react-icons/fi';
import { API_BASE_URL } from '../config/backendConfig';

const StudentConnectedMentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    fetchConnectedMentors();
  }, []);

  const fetchConnectedMentors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/connections/my-connections?status=connected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ [StudentConnectedMentors] Fetched mentors:', data.data);
        setMentors(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch mentors');
        setMentors([]);
      }
    } catch (err) {
      console.error('Error fetching connected mentors:', err);
      setError('Failed to load mentors');
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleMentorClick = (connection) => {
    const mentorId = connection.mentor?._id || connection.mentorId;
    const mentorName = connection.mentor?.name || 'Mentor';
    if (mentorId) {
      navigate(`/mentor-profile?mentor=${encodeURIComponent(mentorName)}&mentorId=${mentorId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your connected mentors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #121212; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #535353; border-radius: 4px; border: 1px solid #202327; }
        ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>

      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FiX className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Connected Mentors</h1>
          <p className="text-gray-400 mt-2">
            {mentors.length} mentor{mentors.length !== 1 ? 's' : ''} connected
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {mentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No connected mentors yet</p>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore Mentors
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mentors.map((connection) => {
              const mentor = connection.mentor;
              if (!mentor) return null;

              const profilePic = mentor.profilePicture || mentor.mentorProfile?.profilePicture;
              const headline = mentor.headline || mentor.mentorProfile?.headline || mentor.company || 'Mentor';

              return (
                <div
                  key={connection._id}
                  onClick={() => handleMentorClick(connection)}
                  className="flex items-center space-x-3 p-3 bg-[#121212] rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-[#1a1a1a] transition-all cursor-pointer"
                >
                  {/* Profile Picture */}
                  <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt={mentor.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{getInitials(mentor.name)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm truncate">{mentor.name}</h3>
                    <p className="text-gray-400 text-xs truncate">{headline}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Mentor Details */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] rounded-lg border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-[#121212]">
              <h2 className="text-xl font-bold text-white">Mentor Details</h2>
              <button
                onClick={() => setSelectedMentor(null)}
                className="p-2 hover:bg-[#202327] rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-2xl overflow-hidden">
                  {selectedMentor.mentor?.profilePicture ? (
                    <img src={selectedMentor.mentor.profilePicture} alt={selectedMentor.mentor.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{getInitials(selectedMentor.mentor?.name)}</span>
                  )}
                </div>
              </div>

              {/* Name and Headline */}
              <div className="text-center">
                <h3 className="text-white font-semibold text-lg">{selectedMentor.mentor?.name}</h3>
                <p className="text-gray-400 text-sm">{selectedMentor.mentor?.headline || 'Mentor'}</p>
              </div>

              {/* Bio */}
              {selectedMentor.mentor?.bio && (
                <div>
                  <p className="text-gray-400 text-xs font-semibold mb-1">Bio</p>
                  <p className="text-gray-300 text-sm">{selectedMentor.mentor.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 border-t border-gray-700 pt-4">
                {selectedMentor.mentor?.email && (
                  <div className="flex items-center space-x-3">
                    <FiMail className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">{selectedMentor.mentor.email}</span>
                  </div>
                )}
                {selectedMentor.mentor?.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <FiPhone className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{selectedMentor.mentor.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(selectedMentor.mentor?.socialLinks?.linkedIn || selectedMentor.mentor?.socialLinks?.github) && (
                <div className="flex items-center space-x-3 border-t border-gray-700 pt-4">
                  {selectedMentor.mentor?.socialLinks?.linkedIn && (
                    <a
                      href={selectedMentor.mentor.socialLinks.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#202327] rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FiLinkedin className="w-4 h-4 text-white" />
                    </a>
                  )}
                  {selectedMentor.mentor?.socialLinks?.github && (
                    <a
                      href={selectedMentor.mentor.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#202327] rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <FiGithub className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedMentor(null);
                  handleMentorClick(selectedMentor);
                }}
                className="w-full mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentConnectedMentors;
