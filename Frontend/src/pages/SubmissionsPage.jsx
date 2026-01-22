import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { API_BASE_URL } from '../config/backendConfig';
import Navbar from '../components/StudentDashboard/Navbar';

const SubmissionsPage = () => {
  const navigate = useNavigate();
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [groupedSubmissions, setGroupedSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch profile
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data.user);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    // Fetch submissions
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/reviews`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          const reviewsList = Array.isArray(data.reviews) ? data.reviews : [];
          setSubmittedReviews(reviewsList);
          
          // Group submissions by mentor with profile picture
          const grouped = {};
          reviewsList.forEach(review => {
            const mentorName = review.mentorId?.name || review.mentor?.name || 'Unknown Mentor';
            const mentorId = review.mentorId?._id || review.mentor?._id;
            const profilePicture = review.mentorId?.profilePicture || review.mentor?.profilePicture;
            
            if (!grouped[mentorName]) {
              grouped[mentorName] = {
                reviews: [],
                mentorId,
                profilePicture
              };
            }
            grouped[mentorName].reviews.push(review);
          });
          
          // Sort each mentor's reviews by date (newest first)
          Object.keys(grouped).forEach(mentorName => {
            grouped[mentorName].reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          });
          
          setGroupedSubmissions(grouped);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchSubmissions();
  }, [navigate]);

  const formatLastInteraction = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Some time ago';
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="h-screen bg-[#000000] text-white overflow-hidden flex flex-col">
      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #121212; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #535353; border-radius: 4px; border: 1px solid #202327; }
        ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        ::-webkit-scrollbar-corner { background: #121212; }
        * { scrollbar-width: thin; scrollbar-color: #535353 #121212; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: #888888 #2a2a2a; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #2a2a2a; border-radius: 6px; margin: 5px 0; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #888888; border-radius: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #999999; }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#000000]/80">
        <Navbar userName={profile?.name || 'Student'} />
      </div>

      <div className="flex-1 pt-20 pb-4 overflow-y-auto custom-scroll">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="p-2 hover:bg-[#202327] rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">All Submissions</h1>
              <p className="text-gray-400 text-sm mt-1">View all your ratings and reviews by mentor</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-gray-400 mr-2" />
              <span className="text-gray-400">Loading submissions...</span>
            </div>
          ) : Object.keys(groupedSubmissions).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedSubmissions).map(([mentorName, mentorData]) => (
                <div key={mentorName} className="bg-[#121212] rounded-lg border border-gray-700 p-6">
                  {/* Mentor Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                        {mentorData.profilePicture ? (
                          <img src={mentorData.profilePicture} alt={mentorName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{getInitials(mentorName)}</span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">{mentorName}</h2>
                        <p className="text-xs text-gray-400">{mentorData.reviews.length} submission{mentorData.reviews.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Average Rating</p>
                      <div className="flex gap-0.5 mt-1 justify-end">
                        {mentorData.reviews.some(r => r.rating) && (
                          <>
                            {(() => {
                              const avgRating = mentorData.reviews.filter(r => r.rating).reduce((sum, r) => sum + r.rating, 0) / mentorData.reviews.filter(r => r.rating).length;
                              return [...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ));
                            })()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submissions List */}
                  <div className="space-y-3">
                    {mentorData.reviews.map((review) => (
                      <div key={review._id} className="p-4 bg-[#202327] rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm text-gray-300 font-medium">Submitted {formatLastInteraction(review.createdAt)}</p>
                            {review.sessionId && (
                              <p className="text-xs text-gray-500 mt-1">Session ID: {review.sessionId}</p>
                            )}
                          </div>
                          {review.rating && (
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          )}
                        </div>

                        {review.review && (
                          <div className="mt-3 p-3 bg-[#121212] rounded border border-gray-700">
                            {review.review.startsWith('http') ? (
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <a href={review.review} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                  📹 Video uploaded
                                </a>
                              </div>
                            ) : (
                              <p className="text-gray-300 text-sm">{review.review}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No submissions yet</h3>
              <p className="text-gray-400 mb-4">Start rating and reviewing your mentors to see submissions here</p>
              <button
                onClick={() => navigate('/student')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionsPage;
