import React, { useState, useEffect } from 'react';
import { FiStar, FiCalendar, FiUsers, FiAward } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/backendConfig';

const ProfileContent = ({ mentorData, activeTab, mentorId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);
  const [freeTrialSubmitting, setFreeTrialSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const token = localStorage.getItem("token");
        if (!token || !mentorId) {
          setReviewsLoading(false);
          return;
        }

        // Fetch reviews for this mentor
        const response = await fetch(`${API_BASE_URL}/reviews?mentorId=${mentorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.success && data.reviews) {
          console.log('📝 [ProfileContent] Fetched reviews:', data.reviews);
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [mentorId]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const token = localStorage.getItem("token");
        if (!token || !mentorId) {
          setVideosLoading(false);
          return;
        }

        // Fetch videos for this mentor (from reviews that contain video URLs)
        const response = await fetch(`${API_BASE_URL}/reviews?mentorId=${mentorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.success && data.reviews) {
          // Filter reviews to only show those with video URLs
          const videoReviews = data.reviews.filter(review => {
            return review.review && (
              review.review.includes('cloudinary.com') || 
              review.review.includes('video/upload') || 
              review.review.startsWith('http')
            );
          });
          console.log('🎥 [ProfileContent] Fetched videos:', videoReviews);
          setVideos(videoReviews);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, [mentorId]);

  const handleFreeTrialClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (!mentorId) return;

      setFreeTrialSubmitting(true);

      const normalizedApiBase = (API_BASE_URL && API_BASE_URL.includes('8081'))
        ? null
        : API_BASE_URL;

      const baseUrls = [
        'https://k23dx.onrender.com',
        normalizedApiBase
      ].filter(Boolean);

      for (const baseUrl of baseUrls) {
        try {
          const url = `${baseUrl}/api/free-trial/request`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mentorId })
          });

          const data = await response.json();
          if (response.ok && data?.success) {
            console.log('[FreeTrial] Using', url);
            setShowFreeTrialModal(true);
            return;
          }
        } catch {
          // try next baseUrl
        }
      }
    } catch (err) {
      return;
    } finally {
      setFreeTrialSubmitting(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Free Trial Section */}
      <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left side - Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#2d2d2d] text-gray-300 border border-[#444]">
                <svg className="w-3 h-3 mr-1 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Limited Time Offer
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Start Your Free Trial</h3>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              Get 7 days of unlimited access to mentorship sessions, group workshops, and personalized guidance. 
              No credit card required.
            </p>
            
            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-left">
              <div className="flex items-center text-xs text-gray-400">
                <svg className="w-3 h-3 mr-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                1-on-1 Mentoring Sessions
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <svg className="w-3 h-3 mr-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Group Workshops
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <svg className="w-3 h-3 mr-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Career Guidance
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <svg className="w-3 h-3 mr-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Resource Library Access
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={handleFreeTrialClick}
              disabled={freeTrialSubmitting}
              className="inline-flex items-center px-4 py-2 bg-[#202327] hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors duration-200 border border-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {freeTrialSubmitting ? 'Sending...' : 'Start Free Trial'}
            </button>
            
            <p className="text-xs text-gray-500 mt-2">
              Cancel anytime • No hidden fees • Full access included
            </p>
          </div>

          {/* Right side - Simple Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-[#2d2d2d] rounded-lg flex items-center justify-center border border-[#444]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderEmptyState = (title) => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No {title} Available</h3>
        <p className="text-sm text-gray-400">There's nothing to show right now</p>
      </div>
    </div>
  );

  const renderReviews = () => {
    if (reviewsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400">Loading reviews...</div>
        </div>
      );
    }

    // Filter reviews to only show those with actual text comments (not just ratings or video URLs)
    const reviewsWithComments = reviews.filter(review => {
      if (!review.review || review.review.trim() === '') return false;
      // Exclude reviews that are just video URLs
      const isVideoUrl = review.review.includes('cloudinary.com') || review.review.includes('video/upload') || review.review.startsWith('http');
      return !isVideoUrl;
    });

    if (!reviewsWithComments || reviewsWithComments.length === 0) {
      return renderEmptyState('Reviews');
    }

    return (
      <>
        <div className="space-y-4">
          {reviewsWithComments.map((review, index) => {
            const studentName = review.student?.name || 'Anonymous';
            const studentInitial = studentName?.charAt(0).toUpperCase() || 'S';
            const reviewText = review.review;
            const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently';
            const truncatedText = reviewText.length > 150 ? reviewText.substring(0, 150) + '...' : reviewText;
            const shouldTruncate = reviewText.length > 150;

            return (
              <div 
                key={review._id || index} 
                className="bg-[#1f1f1f] border border-[#333] rounded-lg p-4 cursor-pointer hover:border-gray-500 transition-colors"
                onClick={() => setSelectedReview(review)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {studentInitial}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{studentName}</h4>
                      <p className="text-xs text-gray-400">{reviewDate}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{truncatedText}</p>
                {shouldTruncate && <p className="text-xs text-blue-400 mt-2">Read more...</p>}
              </div>
            );
          })}
        </div>

        {/* Review Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1f1f1f] border border-[#333] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#1f1f1f] border-b border-[#333] p-6 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {(selectedReview.student?.name || 'A')?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedReview.student?.name || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedReview.review}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderVideos = () => {
    if (videosLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-400">Loading videos...</div>
        </div>
      );
    }

    if (!videos || videos.length === 0) {
      return renderEmptyState('Videos');
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video, index) => (
          <div key={video._id || index} className="bg-[#1f1f1f] border border-[#333] rounded-lg overflow-hidden hover:border-gray-500 transition-colors">
            {/* Video Thumbnail */}
            <div className="relative bg-black h-40 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0015.5 2h-11zM9 6a1 1 0 011.447-.894l4 2.5a1 1 0 010 1.788l-4 2.5A1 1 0 019 11V6z" />
              </svg>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {video.student?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{video.student?.name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">
                    {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              
              {/* Video Link */}
              <a 
                href={video.review} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Watch Video →
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAchievements = () => (
    <div className="space-y-4">
      {renderEmptyState('Achievements')}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'reviews':
        return renderReviews();
      case 'videos':
        return renderVideos();
      case 'achievements':
        return renderAchievements();
      default:
        return renderOverview();
    }
  };

  return (
    <>
      <div className="bg-[#121212] border border-[#333] rounded-lg p-6">
        {renderContent()}
      </div>

      {freeTrialSubmitting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#121212] border border-[#333] rounded-lg px-6 py-5 w-full max-w-sm mx-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div className="ml-3">
                <p className="text-white font-semibold">Sending request…</p>
                <p className="text-sm text-gray-400">Emailing the mentor your details</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free Trial Confirmation Modal */}
      {showFreeTrialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] border border-[#333] rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#333]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email Sent!</h3>
                    <p className="text-sm text-gray-400">Free trial request submitted</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFreeTrialModal(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-white mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h4 className="text-xl font-semibold text-white mb-3">
                  Email has been sent to the mentor!
                </h4>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {mentorData?.name || 'The mentor'} will call you at an appropriate time for your free session. 
                  Please keep your phone available and check your email for further details.
                </p>


                <button
                  onClick={() => setShowFreeTrialModal(false)}
                  className="w-full bg-[#202327] hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-white"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileContent;
