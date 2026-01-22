import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/backendConfig';
import Navbar from '../components/StudentDashboard/Navbar';
import ProfileHeader from '../components/MentorProfile/ProfileHeader';
import ProfileNavigation from '../components/MentorProfile/ProfileNavigation';
import ContributionGraph from '../components/MentorProfile/ContributionGraph';
import ProfileSidebar from '../components/MentorProfile/ProfileSidebar';
import ProfileContent from '../components/MentorProfile/ProfileContent';

const MentorDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mentorName = searchParams.get('mentor');
  const mentorId = searchParams.get('mentorId');
  const [loading, setLoading] = useState(true);
  const [mentorData, setMentorData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMentorData = async () => {
      if (!mentorId) {
        setError("No mentor ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch mentor by ID directly
        const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch mentor');
        }

        if (data.success && data.mentor) {
          const mentor = data.mentor;
          // Transform mentor data to match component structure
          const transformedMentor = {
            id: mentor._id,
            name: mentor.name,
            title: mentor.headline || mentor.mentorProfile?.headline || 'Mentor',
            company: mentor.company || mentor.mentorProfile?.company || 'N/A',
            location: mentor.location || 'Location not specified',
            rating: mentor.averageRating || 0,
            reviews: mentor.totalReviews || 0,
            profileImage: mentor.profilePicture || mentor.mentorProfile?.profilePicture || null,
            bio: mentor.bio || mentor.mentorProfile?.bio || 'No bio available',
            skills: Array.isArray(mentor.skills)
              ? mentor.skills
                  .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
                  .filter(Boolean)
              : [],
            experience: mentor.experience || mentor.mentorProfile?.experience || 'N/A',
            hourlyRate: mentor.hourlyRate || mentor.mentorProfile?.hourlyRate || 0,
            socialLinks: {
              linkedin: mentor.mentorProfile?.socialLinks?.linkedin || '',
              github: mentor.mentorProfile?.socialLinks?.github || ''
            },
            stats: {
              totalMentoringTime: "0 mins",
              sessionsCompleted: mentor.totalSessions || 0,
              averageAttendance: "N/A",
              karmaPoints: mentor.karmaPoints || 0
            }
          };
          
          setMentorData(transformedMentor);
        } else {
          setError('No mentor data received');
        }
      } catch (err) {
        console.error('Error fetching mentor data:', err);
        setError(err.message || 'Failed to fetch mentor data');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [navigate, mentorId]);

  // Function to handle date selection
  const handleDateSelect = (day, month = 12, year = 2024) => {
    const selectedDateObj = new Date(year, month - 1, day);
    const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    setSelectedDate({ day, month, year, formatted: formattedDate });
  };

  // Function to handle booking button click
  const handleBookSession = () => {
    navigate(`/booking?mentor=${encodeURIComponent(mentorName)}&mentorId=${mentorData.id}`);
  };

  // Function to handle continue from first modal to time slot selection
  const handleContinueToTimeSlot = () => {
    setShowBookingModal(false);
    setShowTimeSlotModal(true);
  };

  // Function to handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Navbar with fixed positioning */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#000000]">
        <Navbar userName={user?.name || 'Student'} />
      </div>
      
      {/* Main content with top padding to account for fixed navbar */}
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading mentor profile...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Error loading mentor profile</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : !mentorData ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">No mentor data found</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <ProfileHeader mentorData={mentorData} mentorId={mentorId} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-9 space-y-6">
                {/* Navigation Tabs */}
                <ProfileNavigation 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                />

                {/* Contribution Graph - Only show on Overview tab */}
                {activeTab === 'overview' && (
                  <ContributionGraph mentorData={mentorData} mentorId={mentorId} />
                )}

                {/* Tab Content */}
                <ProfileContent 
                  mentorData={mentorData} 
                  activeTab={activeTab}
                  mentorId={mentorId}
                />
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-3">
                <ProfileSidebar 
                  mentorData={mentorData} 
                  onBookSession={handleBookSession}
                  mentorId={mentorId}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{mentorData?.name}</h2>
                <p className="text-gray-600">{mentorData?.title}</p>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side - Session Details */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Price</h3>
                    <p className="text-2xl font-bold text-gray-900">Free</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Session duration</h3>
                    <p className="text-gray-900">1 session × 60 minutes</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">About</h3>
                    <p className="text-gray-900 font-medium">Mentoring - {mentorData?.skills?.slice(0, 3).join(', ')}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {mentorData?.skills?.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side - Date and Time Selection */}
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Select date and time</h3>
                      <span className="text-sm text-gray-500">STEP 1 of 3</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      In your local timezone (Asia/Kolkata) 
                      <button className="text-blue-600 hover:text-blue-700 ml-1">Update</button>
                    </p>
                  </div>

                  {/* Calendar in Modal */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">January 2026</h4>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="p-2 font-medium text-gray-500">{day}</div>
                      ))}
                      {Array.from({ length: 35 }, (_, i) => {
                        const day = i < 5 ? 26 + i : i > 30 ? i - 30 : i - 4;
                        const isCurrentMonth = i >= 5 && i <= 30;
                        const isSelected = i === 15;
                        
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-gray-900 text-white' 
                                : isCurrentMonth 
                                  ? 'text-gray-700 hover:bg-gray-100' 
                                  : 'text-gray-300'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="bg-blue-50 p-3 rounded-lg mb-6">
                    <p className="text-sm text-blue-800 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      This session repeats every Saturday
                    </p>
                  </div>

                  {/* Continue Button */}
                  <button 
                    onClick={handleContinueToTimeSlot}
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Selection Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sai - Mentoring - Cloud, Data and AI</h2>
                <p className="text-gray-600">{mentorData?.name} • {mentorData?.title}</p>
              </div>
              <button 
                onClick={() => setShowTimeSlotModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side - Session Details */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Price</h3>
                    <p className="text-2xl font-bold text-gray-900">Free</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Session duration</h3>
                    <p className="text-gray-900">15 sessions × 60 minutes</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">About</h3>
                    <p className="text-gray-900 font-medium">Sai - Mentoring - Cloud, Data and AI Professional</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Databricks</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">TensorFlow</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Qualtrics</span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Time Slot Selection */}
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Select available time</h3>
                      <span className="text-sm text-gray-500">STEP 2 of 3</span>
                    </div>
                    <p className="text-sm text-gray-600">In your local timezone (Asia/Kolkata)</p>
                  </div>

                  {/* Selected Date */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Date: <span className="font-medium text-gray-900">Saturday, 10 January - 18 Apr, 2026</span>
                      <button className="text-blue-600 hover:text-blue-700 ml-2">Change</button>
                    </p>
                  </div>

                  {/* Available Time Slots */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Available time slots</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['3:30 am', '5:30 am', '5:45 am', '6:00 am', '6:15 am', '6:30 am'].map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSlotSelect(time)}
                          className={`p-3 text-center border rounded-lg transition-colors ${
                            selectedTimeSlot === time
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button 
                    disabled={!selectedTimeSlot}
                    className={`w-full py-3 px-4 rounded-lg transition-colors font-medium ${
                      selectedTimeSlot
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDetailPage;