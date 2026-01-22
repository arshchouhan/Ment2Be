import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/backendConfig';
import Navbar from '../components/StudentDashboard/Navbar';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiBook, FiX } from 'react-icons/fi';

const ConnectedStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchConnectedStudents();
  }, [navigate]);

  const fetchConnectedStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/connections/mentor-connections?status=connected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ [ConnectedStudents] Fetched connections:', data.data);
        
        // The student data from connections endpoint already has the populated student info
        // Just use it directly as it contains all necessary fields
        setStudents(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch connected students');
      }
    } catch (err) {
      console.error('Error fetching connected students:', err);
      setError('Error fetching connected students');
    } finally {
      setLoading(false);
    }
  };

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#000000]">
        <Navbar userName={user?.name || 'Mentor'} />
      </div>

      {/* Main Content */}
      <div className="pt-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/mentor/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Connected Students</h1>
          <span className="text-gray-400 text-lg">({students.length})</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading students...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && students.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No connected students yet</div>
            <p className="text-gray-500 text-sm mt-2">Students will appear here when they connect with you</p>
          </div>
        )}

        {/* Students List - Horizontal Cards */}
        {!loading && !error && students.length > 0 && (
          <div className="space-y-3">
            {students.map((connection) => {
              const student = connection.student;

              return (
                <button
                  key={connection._id}
                  onClick={() => setSelectedStudent(connection)}
                  className="w-full bg-[#121212] border border-gray-700 rounded-lg p-3 hover:border-blue-500 hover:bg-[#1a1a1a] transition-all cursor-pointer flex items-center space-x-3 text-left"
                >
                  {/* Profile Image */}
                  <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {student?.profilePicture ? (
                      <img
                        src={student.profilePicture}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-white">{getInitials(student?.name)}</div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{student?.name || 'Unknown Student'}</h3>
                    <p className="text-xs text-gray-400 truncate">
                      {student?.headline || student?.email || 'Student'}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex-shrink-0">
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Full Student Details */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] border border-[#333] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1f1f1f] border-b border-[#333] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Student Details</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selectedStudent.student?.profilePicture ? (
                    <img
                      src={selectedStudent.student.profilePicture}
                      alt={selectedStudent.student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-3xl font-bold text-gray-400">{getInitials(selectedStudent.student?.name)}</div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedStudent.student?.name || 'Unknown'}</h3>
                  <p className="text-gray-400 mt-1">{selectedStudent.student?.headline || 'No headline'}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Connected {new Date(selectedStudent.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {selectedStudent.student?.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Bio</h4>
                  <p className="text-gray-300">{selectedStudent.student.bio}</p>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  {selectedStudent.student?.email && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <FiMail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>{selectedStudent.student.email}</span>
                    </div>
                  )}
                  {selectedStudent.student?.phoneNumber && (
                    <div className="flex items-center space-x-3 text-gray-300">
                      <FiPhone className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{selectedStudent.student.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Goals */}
              {selectedStudent.student?.goals && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center space-x-2">
                    <FiBook className="w-4 h-4 text-purple-400" />
                    <span>Learning Goals</span>
                  </h4>
                  <p className="text-gray-300">{selectedStudent.student.goals}</p>
                </div>
              )}

              {/* Interests */}
              {selectedStudent.student?.interests && selectedStudent.student.interests.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.student.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#2d2d2d] text-sm text-gray-300 rounded-full border border-[#444]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectedStudents;
