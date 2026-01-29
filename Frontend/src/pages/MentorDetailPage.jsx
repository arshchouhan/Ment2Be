import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/backendConfig';
import Navbar from '../components/StudentDashboard/Navbar';
import ProfileHeader from '../components/MentorProfile/ProfileHeader';
import ProfileNavigation from '../components/MentorProfile/ProfileNavigation';
import ContributionGraph from '../components/MentorProfile/ContributionGraph';
import ProfileSidebar from '../components/MentorProfile/ProfileSidebar';
import ProfileContent from '../components/MentorProfile/ProfileContent';
import BookingCalendar from '../components/BookingCalendar';

const MentorDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mentorName = searchParams.get('mentor');
  const mentorId = searchParams.get('mentorId');
  const [loading, setLoading] = useState(true);
  const [mentorData, setMentorData] = useState(null);
  const [error, setError] = useState(null);
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


    </div>
  );
};

export default MentorDetailPage;