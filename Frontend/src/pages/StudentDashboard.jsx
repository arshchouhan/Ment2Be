import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiBookOpen, FiTrendingUp, FiUserPlus, FiLoader, FiX, FiCheck, FiAward, FiLogOut, FiStar } from 'react-icons/fi';
import { API_BASE_URL } from '../config/backendConfig';
import Navbar from '../components/StudentDashboard/Navbar';
import SessionTimer from '../components/SessionTimer';
import KarmaPointsCard from '../components/KarmaPointsCard/KarmaPointsCard';
import RateModal from '../components/StudentDashboard/RateModal';
import ReviewModal from '../components/StudentDashboard/ReviewModal';
import VideoUploadModal from '../components/StudentDashboard/VideoUploadModal';
import PageLoader from '../components/PageLoader';
import { formatDistanceToNow } from 'date-fns';
import { fetchStudentTasks } from '../services/studentTasksApi';

// Mentor Card Component with Availability
const MentorCard = ({ mentor, onNavigate }) => {
  const [availability, setAvailability] = useState(null);
  const [loadingAvail, setLoadingAvail] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/mentor-availability/latest/${mentor._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success && data.data) {
          setAvailability(data.data);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoadingAvail(false);
      }
    };
    fetchAvailability();
  }, [mentor._id]);

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatLastInteraction = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Some time ago';
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-3 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors cursor-pointer" onClick={() => onNavigate(`/mentor-detail?mentorId=${mentor._id}&mentor=${encodeURIComponent(mentor.name)}`)}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          {mentor.hasConfirmedSession && (<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121212] z-10"></div>)}
          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
            {(mentor.profilePicture && mentor.profilePicture.trim()) || mentor.mentorProfile?.profilePicture ? (
              <img src={mentor.profilePicture && mentor.profilePicture.trim() ? mentor.profilePicture : mentor.mentorProfile?.profilePicture} alt={mentor.name} className="h-full w-full object-cover" />
            ) : (
              <span>{getInitials(mentor.name)}</span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{mentor.name}</p>
          <p className="text-gray-400 text-xs">{mentor.title || 'Mentor'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#535353] text-white text-xs font-medium px-2 py-0.5 rounded">
            <FiStar className="text-white mr-1" size={12} />
            {Number(mentor.averageRating || 0).toFixed(1)} ({mentor.totalReviews || 0})
          </div>
          <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">{formatLastInteraction(mentor.lastInteraction || mentor.createdAt || mentor.updatedAt)}</span>
        </div>
      </div>
      {!loadingAvail && availability && (
        <div className="flex items-center space-x-2 text-xs">
          <FiCalendar className="w-3 h-3 text-white" />
          <span className="text-gray-300 font-medium">{availability.timeSlots?.length || 0} slots available</span>
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [topExperts, setTopExperts] = useState([]);
  const [topExpertsLoading, setTopExpertsLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [groupedSubmissions, setGroupedSubmissions] = useState({});
  const [connectedMentorsCount, setConnectedMentorsCount] = useState(0);
  const [connectedMentorsLoading, setConnectedMentorsLoading] = useState(true);

  // Modal states
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rateTab, setRateTab] = useState('rate'); // 'rate' or 'submissions'

  // Profile completion form state
  const showProfileForm = searchParams.get('complete-profile') === 'true';
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    interests: '',
    goals: '',
    phoneNumber: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    profilePicture: null
  });
  const [formLoading, setFormLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setProfile(data.user);
        console.log('User data fetched:', data.user);
        console.log('Phone number from API:', data.user.phoneNumber);
        // Pre-fill form with existing data
        if (data.user) {
          setFormData({
            bio: data.user.bio || '',
            skills: Array.isArray(data.user.skills) ? data.user.skills.join(', ') : '',
            interests: Array.isArray(data.user.interests) ? data.user.interests.join(', ') : (data.user.interests || ''),
            goals: data.user.goals || '',
            phoneNumber: data.user.phoneNumber || '',
            linkedIn: data.user.socialLinks?.linkedIn || '',
            github: data.user.socialLinks?.github || '',
            portfolio: data.user.socialLinks?.portfolio || '',
            profilePicture: null
          });
          // Set image preview if profile picture exists
          if (data.user.profilePicture) {
            setImagePreview(data.user.profilePicture);
          }
        }
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
    fetchRecentMentors();
    fetchTopExperts();
    fetchUpcomingSessions();
    fetchRecentMessages();
    fetchRecentTasks();
    fetchSubmittedReviews();
    fetchConnectedMentorsCount();
  }, [navigate]);

  const fetchRecentMentors = async () => {
    try {
      setMentorsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch connected mentors sorted by connection date (most recent first)
      const response = await fetch('https://k23dx.onrender.com/api/connections/my-connections?status=connected', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connected mentors');
      }

      const data = await response.json();
      const connections = Array.isArray(data.data) ? data.data : [];

      console.log('✅ [fetchRecentMentors] Connected mentors:', connections);

      // Map connections to mentor format, sorted by connectedAt (most recent first)
      const recentMentors = connections
        .sort((a, b) => new Date(b.connectedAt) - new Date(a.connectedAt))
        .map(conn => ({
          _id: conn.mentor?._id,
          name: conn.mentor?.name,
          profilePicture: conn.mentor?.profilePicture,
          title: conn.mentor?.headline || 'Mentor',
          averageRating: conn.mentor?.averageRating || 0,
          totalReviews: conn.mentor?.totalReviews || 0,
          lastInteraction: conn.connectedAt,
          hasConfirmedSession: false
        }))
        .filter(mentor => mentor._id); // Filter out any invalid entries

      console.log('✅ [fetchRecentMentors] Recent mentors:', recentMentors);
      setMentors(recentMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setMentors([]);
    } finally {
      setMentorsLoading(false);
    }
  };

  const fetchTopExperts = async () => {
    try {
      setTopExpertsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/mentors/top-experts?limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top experts');
      }

      const data = await response.json();
      const experts = Array.isArray(data.mentors) ? data.mentors : [];
      
      console.log(' Top Experts:', experts);
      setTopExperts(experts);
    } catch (error) {
      console.error('Error fetching top experts:', error);
      setTopExperts([]);
    } finally {
      setTopExpertsLoading(false);
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

  const formatLastInteraction = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Some time ago';
    }
  };

  const fetchConnectedMentorsCount = async () => {
    try {
      setConnectedMentorsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/connections/my-connections?status=connected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ [StudentDashboard] Connected mentors count:', data.count);
        setConnectedMentorsCount(data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching connected mentors count:', err);
      setConnectedMentorsCount(0);
    } finally {
      setConnectedMentorsLoading(false);
    }
  };

  const fetchUpcomingSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSessionsLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Bookings API Response:', data);

      if (response.ok && data.success && data.bookings) {
        const now = new Date();
        
        // Filter for UPCOMING sessions (not completed, future date)
        const upcomingSessions = data.bookings.filter(booking => {
          const sessionDate = new Date(booking.sessionDate);
          return booking.status !== 'completed' && sessionDate >= now;
        }).sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

        // Filter for COMPLETED sessions (completed status OR past date)
        const completedSessions = data.bookings.filter(booking => {
          const sessionDate = new Date(booking.sessionDate);
          return booking.status === 'completed' || sessionDate < now;
        }).sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

        console.log('Filtered upcoming bookings:', upcomingSessions);
        console.log('Filtered completed bookings:', completedSessions);

        // Map booking to session format with mentor data
        const mapBookingToSession = (booking) => {
          const mentorData = booking.mentor || booking.mentorId || {};
          const mentorId = mentorData._id || mentorData.id || booking.mentorId;
          
          return {
            _id: booking._id,
            sessionId: booking._id,
            mentorId: {
              _id: mentorId,
              name: mentorData.name || 'Mentor',
              email: mentorData.email,
              profilePicture: mentorData.profilePicture || mentorData.mentorProfile?.profilePicture || '',
              headline: mentorData.headline || mentorData.mentorProfile?.headline || ''
            },
            mentor: mentorData,
            sessionDate: booking.sessionDate,
            sessionTime: booking.sessionTime,
            duration: booking.duration,
            startTime: booking.sessionDate,
            status: booking.status
          };
        };

        setUpcomingSessions(upcomingSessions.map(mapBookingToSession).slice(0, 1));
        setCompletedSessions(completedSessions.map(mapBookingToSession).slice(0, 2));
      } else {
        console.log('No bookings found or invalid response');
        setUpcomingSessions([]);
        setCompletedSessions([]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setUpcomingSessions([]);
      setCompletedSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchRecentMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setMessagesLoading(true);
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(' Raw Messages API Response:', data); // Debug log
        
        let conversations = [];
        if (Array.isArray(data.data)) {
          conversations = data.data;
        } else if (Array.isArray(data.conversations)) {
          conversations = data.conversations;
        } else if (data.success && Array.isArray(data.data)) {
          conversations = data.data;
        }
        
        console.log(' Conversations found:', conversations.length); // Debug log
        
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser._id || currentUser.id;

        const messages = conversations
          .filter(conv => conv.lastMessage)
          .filter(conv => conv.lastSender !== currentUserId) // Only show messages from mentors
          .map(conv => {
            return {
              _id: conv.conversationId || Math.random(),
              senderId: conv.lastSender,
              senderName: conv.participantName || 'Unknown',
              content: conv.lastMessage || 'No message',
              timestamp: conv.lastMessageTime || new Date().toISOString(),
              participantId: conv.participantId,
              profilePicture: conv.participantProfilePicture || ''
            };
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 2);

        // Fetch profile pictures for participants who don't have them
        const enrichedMessages = await Promise.all(
          messages.map(async (msg) => {
            if (!msg.profilePicture && msg.participantId) {
              try {
                const mentorResponse = await fetch(`${API_BASE_URL}/mentors/${msg.participantId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (mentorResponse.ok) {
                  const mentorData = await mentorResponse.json();
                  if (mentorData.mentor?.profilePicture) {
                    msg.profilePicture = mentorData.mentor.profilePicture;
                  }
                }
              } catch (err) {
                console.error(`Error fetching profile picture for participant ${msg.participantId}:`, err);
              }
            }
            return msg;
          })
        );

        console.log(' Processed messages with profile pictures:', enrichedMessages); // Debug log
        setRecentMessages(enrichedMessages);
      } else {
        console.error(' API Error:', response.status);
        setRecentMessages([]);
      }
    } catch (err) {
      console.error(' Error fetching messages:', err);
      setRecentMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      setTasksLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user._id) {
        setRecentTasks([]);
        setTasksLoading(false);
        return;
      }

      const data = await fetchStudentTasks(user._id);
      
      // Get the 3 most recent tasks sorted by creation date
      const tasks = Array.isArray(data.tasks) ? data.tasks : [];
      const recentTasksList = tasks
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3);
      
      setRecentTasks(recentTasksList);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setRecentTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  // Helper functions to check if session already has submissions
  const hasRatingForSession = (sessionId) => {
    return submittedReviews.some(review => 
      (review.booking === sessionId || review.session === sessionId || 
       review.booking?._id === sessionId || review.session?._id === sessionId) && 
      review.rating && !review.review
    );
  };

  const hasVideoForSession = (sessionId) => {
    return submittedReviews.some(review => 
      (review.booking === sessionId || review.session === sessionId || 
       review.booking?._id === sessionId || review.session?._id === sessionId) && 
      review.review && review.review.startsWith('http')
    );
  };

  const hasReviewForSession = (sessionId) => {
    return submittedReviews.some(review => 
      (review.booking === sessionId || review.session === sessionId || 
       review.booking?._id === sessionId || review.session?._id === sessionId) && 
      review.review && !review.review.startsWith('http')
    );
  };

  const fetchSubmittedReviews = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setReviewsLoading(false);
      return;
    }

    try {
      setReviewsLoading(true);
      console.log('Fetching submitted reviews for current user...');
      
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Reviews API response status:', response.status);
      const data = await response.json();
      console.log('Reviews API response data:', data);
      console.log('Reviews array:', data.reviews);
      console.log('Reviews count:', data.reviews?.length);
      
      if (response.ok) {
        const reviewsList = Array.isArray(data.reviews) ? data.reviews : [];
        setSubmittedReviews(reviewsList);
        
        // Group submissions by mentor name
        const grouped = {};
        reviewsList.forEach(review => {
          const mentorName = review.mentorId?.name || review.mentor?.name || 'Unknown Mentor';
          if (!grouped[mentorName]) {
            grouped[mentorName] = [];
          }
          grouped[mentorName].push(review);
        });
        setGroupedSubmissions(grouped);
        
        console.log('Submitted reviews loaded successfully:', reviewsList.length, 'reviews');
        console.log('Grouped submissions:', grouped);
      } else {
        console.log('API error:', data.message);
        setSubmittedReviews([]);
        setGroupedSubmissions({});
      }
    } catch (err) {
      console.error('Error fetching submitted reviews:', err);
      setSubmittedReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleJoinSession = async (session) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to join the session');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/bookings/${session._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const meetingUrl = `/student/meeting/${encodeURIComponent(data.data.roomId)}/${data.data.sessionId}`;
        navigate(meetingUrl);
      } else {
        alert(data.message || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
    }
  };

  const handleCompleteProfile = () => {
    setSearchParams({ 'complete-profile': 'true' });
  };

  const handleCloseProfileForm = () => {
    setSearchParams({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert('Please login to update profile');
        return;
      }

      const submitData = new FormData();
      submitData.append('bio', formData.bio);
      submitData.append('skills', formData.skills);
      submitData.append('interests', formData.interests);
      submitData.append('goals', formData.goals);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('linkedIn', formData.linkedIn);
      submitData.append('github', formData.github);
      submitData.append('portfolio', formData.portfolio);

      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setSearchParams({});
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const initials = profile?.name
    ? profile.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : "";

  const joinedLabel = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '';

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;
    
    const fields = [
      profile.name,
      profile.email,
      profile.bio,
      profile.skills && profile.skills.length > 0,
      profile.interests,
      profile.goals,
      profile.phoneNumber,
      profile.profilePicture,
      profile.socialLinks?.linkedIn,
      profile.socialLinks?.github
    ];
    
    const completedFields = fields.filter(field => {
      if (typeof field === 'string') return field.trim().length > 0;
      if (Array.isArray(field)) return field.length > 0;
      return Boolean(field);
    }).length;
    
    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion(profile);

  if (loading)
    return <PageLoader label="Loading dashboard..." />;

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

      <div className="flex-1 pt-20 pb-4">
        <div className="h-full max-w-[95%] mx-auto grid grid-cols-12 gap-3">
          {/* LEFT COLUMN - Profile Card */}
          <aside className="col-span-2 bg-[#121212] rounded-lg p-4 border border-gray-700 h-fit">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-full h-full rounded-lg bg-gray-700 overflow-hidden border-4 border-gray-600 flex items-center justify-center">
                  {profile?.profilePicture ? (
                    <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-gray-300">
                      {initials || ""}
                    </div>
                  )}
                </div>

              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white">{profile?.name}</h2>
                <p className="text-gray-400 text-xs">{profile?.email}</p>
              </div>

              <div className="w-full space-y-1.5 mt-4 border-t border-gray-600 pt-3">

                <button
                  onClick={() => navigate('/student/mentors')}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-gray-300 text-sm hover:bg-[#202327] rounded-lg transition-colors text-left"
                >
                  <FiUser className="w-4 h-4 text-white" />
                  <span>Mentors: {connectedMentorsLoading ? '...' : connectedMentorsCount}</span>
                </button>

                <div className="flex items-center space-x-2 px-3 py-1.5 text-gray-300 text-sm">
                  <FiAward className="w-4 h-4 text-white" />
                  <span>Karma Points: {profile?.karmaPoints || 0}</span>
                </div>

                <div className="flex items-center space-x-2 px-3 py-1.5 text-gray-300 text-sm">
                  <FiCalendar className="w-4 h-4 text-white" />
                  <span>Sessions: {profile?.totalSessions || 0}</span>
                </div>

                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-gray-300 hover:bg-[#212121] rounded-lg transition-colors text-sm mt-2"
                >
                  <FiLogOut className="w-4 h-4 text-white" />
                  <span>Sign out</span>
                </button>
              </div>

              <div className="w-full border-t border-gray-600 pt-3 text-center">
                <p className="text-gray-500 text-xs">Joined {joinedLabel}</p>
              </div>
            </div>
          </aside>

          {/* MIDDLE COLUMN - Main Content OR Profile Form */}
          <main className="col-span-7 space-y-3 overflow-y-scroll scrollbar-hide h-full max-h-[calc(100vh-6rem)]">
            {showProfileForm ? (
              <div className="bg-[#121212] rounded-lg shadow border border-gray-700 flex flex-col h-full max-h-[calc(100vh-7rem)]">
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700">
                  <div>
                    <h1 className="text-xl font-bold text-white">Complete Your Profile</h1>
                    <p className="text-sm text-gray-400 mt-1">Help mentors get to know you better</p>
                  </div>
                  <button onClick={handleCloseProfileForm} className="p-2 hover:bg-[#202327] rounded-lg transition-colors">
                    <FiX className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="space-y-5 p-6 overflow-y-auto custom-scroll flex-1">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-24 h-24">
                          <div className="w-full h-full rounded-full bg-gray-700 overflow-hidden border-4 border-gray-600 flex items-center justify-center">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-300">{initials || "??"}</div>
                            )}
                          </div>
                          <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors border-2 border-[#121212]">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </label>
                          <input id="profile-picture-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400">Click the camera icon to upload a new picture</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea name="bio" value={formData.bio} onChange={handleFormChange} rows={4} placeholder="Tell us about yourself..." className="w-full px-4 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                      <input type="text" name="skills" value={formData.skills} onChange={handleFormChange} placeholder="e.g., JavaScript, React, Python (comma separated)" className="w-full px-4 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Interests</label>
                      <input type="text" name="interests" value={formData.interests} onChange={handleFormChange} placeholder="What topics interest you?" className="w-full px-4 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Learning Goals</label>
                      <textarea name="goals" value={formData.goals} onChange={handleFormChange} rows={3} placeholder="What do you want to achieve?" className="w-full px-4 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          value={(() => {
                            const phone = formData.phoneNumber || '';
                            if (phone.startsWith('+971')) return '+971';
                            if (phone.startsWith('+91')) return '+91';
                            if (phone.startsWith('+86')) return '+86';
                            if (phone.startsWith('+81')) return '+81';
                            if (phone.startsWith('+65')) return '+65';
                            if (phone.startsWith('+61')) return '+61';
                            if (phone.startsWith('+49')) return '+49';
                            if (phone.startsWith('+44')) return '+44';
                            if (phone.startsWith('+33')) return '+33';
                            if (phone.startsWith('+1')) return '+1';
                            return '+1';
                          })()}
                          onChange={(e) => {
                            const code = e.target.value;
                            const number = formData.phoneNumber?.replace(/^\+\d+\s*/, '') || '';
                            setFormData({ ...formData, phoneNumber: code + ' ' + number });
                          }}
                          className="w-28 px-2 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+65">🇸🇬 +65</option>
                        </select>
                        <input
                          type="tel"
                          value={(() => {
                            const phone = formData.phoneNumber || '';
                            if (phone.startsWith('+971')) return phone.slice(4).replace(/^\s*/, '');
                            if (phone.startsWith('+91')) return phone.slice(3).replace(/^\s*/, '');
                            if (phone.startsWith('+86')) return phone.slice(3).replace(/^\s*/, '');
                            if (phone.startsWith('+81')) return phone.slice(3).replace(/^\s*/, '');
                            if (phone.startsWith('+65')) return phone.slice(3).replace(/^\s*/, '');
                            if (phone.startsWith('+61')) return phone.slice(3).replace(/^\s*/, '');
                            if (phone.startsWith('+49')) return phone.slice(3).replace(/^\s*/, '');
                            if (phone.startsWith('+44')) return phone.slice(3).replace(/^\s*/, '');
                            if (phone.startsWith('+33')) return phone.slice(3).replace(/^\s*/, '');
                            if (phone.startsWith('+1')) return phone.slice(2).replace(/^\s*/, '');
                            return phone;
                          })()}
                          onChange={(e) => {
                            const phone = formData.phoneNumber || '';
                            let code = '+1';
                            if (phone.startsWith('+971')) code = '+971';
                            else if (phone.startsWith('+91')) code = '+91';
                            else if (phone.startsWith('+86')) code = '+86';
                            else if (phone.startsWith('+81')) code = '+81';
                            else if (phone.startsWith('+65')) code = '+65';
                            else if (phone.startsWith('+61')) code = '+61';
                            else if (phone.startsWith('+49')) code = '+49';
                            else if (phone.startsWith('+44')) code = '+44';
                            else if (phone.startsWith('+33')) code = '+33';
                            else if (phone.startsWith('+1')) code = '+1';
                            setFormData({ ...formData, phoneNumber: code + ' ' + e.target.value });
                          }}
                          className="flex-1 px-4 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Profile</label>
                        <input type="url" name="linkedIn" value={formData.linkedIn} onChange={handleFormChange} placeholder="https://linkedin.com/in/yourprofile" className="w-full px-4 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Profile</label>
                        <input type="url" name="github" value={formData.github} onChange={handleFormChange} placeholder="https://github.com/yourusername" className="w-full px-4 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio Website</label>
                        <input type="url" name="portfolio" value={formData.portfolio} onChange={handleFormChange} placeholder="https://yourportfolio.com" className="w-full px-4 py-3 bg-[#202327] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-4 border-t border-gray-700 bg-[#121212]">
                    <div className="flex items-center justify-end space-x-3">
                      <button type="button" onClick={handleCloseProfileForm} className="px-6 py-2.5 bg-[#202327] text-gray-300 rounded-lg hover:bg-[#2a2d32] transition-colors">Cancel</button>
                      <button type="submit" disabled={formLoading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                        {formLoading ? (<><FiLoader className="animate-spin w-4 h-4 mr-2" />Saving...</>) : (<><FiCheck className="w-4 h-4 mr-2" />Save Profile</>)}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700">
                  <h1 className="text-lg font-bold text-white">Welcome back, {profile?.name || 'Student'}!</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Your learning journey at a glance</p>
                </div>

                {error && (
                  <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center">
                      <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Your Tasks
                    </h2>
                    <button onClick={() => navigate('/student/tasks')} className="text-[#535353] hover:text-white text-xs font-medium">View All</button>
                  </div>

                  {tasksLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-xs">Loading tasks...</p>
                    </div>
                  ) : recentTasks.length > 0 ? (
                    <div className="space-y-2">
                      {recentTasks.map((task) => {
                        const getStatusColor = (status) => {
                          switch(status) {
                            case 'completed': return 'bg-gray-800 text-gray-200 border border-gray-700';
                            case 'in-progress': return 'bg-gray-800 text-gray-200 border border-gray-700';
                            case 'pending-review': return 'bg-gray-800 text-gray-200 border border-gray-700';
                            case 'not-started': return 'bg-gray-800 text-gray-200 border border-gray-700';
                            default: return 'bg-gray-800 text-gray-200 border border-gray-700';
                          }
                        };
                        
                        const getPriorityColor = (priority) => {
                          switch(priority) {
                            case 'high': return 'bg-gray-800 text-gray-200 border border-gray-700';
                            case 'medium': return 'bg-gray-800 text-gray-200 border border-gray-700';
                            case 'low': return 'bg-gray-800 text-gray-200 border border-gray-700';
                            default: return 'bg-gray-800 text-gray-200 border border-gray-700';
                          }
                        };

                        return (
                          <div key={task._id} className="flex items-start space-x-3 p-3 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors cursor-pointer" onClick={() => navigate('/student/tasks')}>
                            <div className="flex-1 min-w-0">
                              <p className={`text-white font-medium text-sm ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{task.description || 'No description'}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusColor(task.status)}`}>
                                  {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ') : 'Not Started'}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                                  {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-auto">{formatLastInteraction(task.createdAt)}</span>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm">No tasks assigned yet</p>
                      <button onClick={() => navigate('/student/tasks')} className="mt-2 text-gray-300 hover:text-white text-xs font-medium">View all tasks</button>
                    </div>
                  )}
                </div>

                <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center">
                      <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Recent Messages
                    </h2>
                    <button onClick={() => navigate('/student/chat')} className="text-[#535353] hover:text-white text-xs font-medium">View All</button>
                  </div>

                  {messagesLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-xs">Loading messages...</p>
                    </div>
                  ) : recentMessages && recentMessages.length > 0 ? (
                    <div className="space-y-3">
                      {recentMessages.map((msg) => (
                        <div key={msg._id || msg.participantId} className="flex items-start space-x-3 p-3 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors cursor-pointer" onClick={() => navigate('/student/chat')}>
                          <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
                            {msg.profilePicture ? (
                              <img src={msg.profilePicture} alt={msg.senderName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{getInitials(msg.senderName || 'Unknown')}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-medium text-sm truncate">{msg.senderName || 'Unknown Mentor'}</p>
                              <span className="text-gray-400 text-xs">{msg.timestamp ? formatLastInteraction(msg.timestamp) : 'Just now'}</span>
                            </div>
                            <p className="text-gray-300 text-xs mt-1 line-clamp-2">{msg.content || 'No message content'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm">No messages yet</p>
                      <button onClick={() => navigate('/student/chat')} className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium">Start a conversation</button>
                    </div>
                  )}
                </div>

                <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center">
                      <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      Rate Your Mentor
                    </h2>
                    <button onClick={() => navigate('/student/submissions')} className="text-[#535353] hover:text-white text-xs font-medium">View All</button>
                  </div>

                  {/* Tab Buttons */}
                  <div className="flex mb-3 bg-[#202327] rounded-lg p-1">
                    <button
                      onClick={() => setRateTab('rate')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${rateTab === 'rate' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Rate Mentor
                    </button>
                    <button
                      onClick={() => setRateTab('submissions')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${rateTab === 'submissions' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Submissions
                    </button>
                  </div>

                  {rateTab === 'rate' ? (
                    /* Rate Mentor Tab */
                    completedSessions.length > 0 ? (
                      <div className="space-y-3">
                        {completedSessions.slice(0, 2).map((session) => (
                          <div key={session._id} className="p-3 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden">
                                {session.mentorId?.profilePicture ? (
                                  <img src={session.mentorId.profilePicture} alt={session.mentorId?.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span>{session.mentorId?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}</span>
                                )}
                              </div>
                              <p className="text-white font-medium text-xs truncate">{session.mentorId?.name}</p>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-2.5">Click on the buttons below to see session details for which you are rating</p>
                            <div className="grid grid-cols-3 gap-2">
                              <button 
                                onClick={() => {
                                  if (!hasRatingForSession(session._id)) {
                                    setSelectedSession(session);
                                    setRateModalOpen(true);
                                  }
                                }}
                                disabled={hasRatingForSession(session._id)}
                                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center ${
                                  hasRatingForSession(session._id) 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                                title={hasRatingForSession(session._id) ? 'Already rated' : 'Rate this session'}
                              >
                                {hasRatingForSession(session._id) ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Rate
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => {
                                  if (!hasVideoForSession(session._id)) {
                                    setSelectedSession(session);
                                    setVideoModalOpen(true);
                                  }
                                }}
                                disabled={hasVideoForSession(session._id)}
                                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center ${
                                  hasVideoForSession(session._id) 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                                title={hasVideoForSession(session._id) ? 'Already uploaded' : 'Upload video'}
                              >
                                {hasVideoForSession(session._id) ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Video
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => {
                                  if (!hasReviewForSession(session._id)) {
                                    setSelectedSession(session);
                                    setReviewModalOpen(true);
                                  }
                                }}
                                disabled={hasReviewForSession(session._id)}
                                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center ${
                                  hasReviewForSession(session._id) 
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                                title={hasReviewForSession(session._id) ? 'Already reviewed' : 'Write a review'}
                              >
                                {hasReviewForSession(session._id) ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Review
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">No sessions to rate</p>
                        <p className="text-[11px] text-gray-500 mt-1">Book a session first</p>
                      </div>
                    )
                  ) : (
                    /* Submissions Tab */
                    reviewsLoading ? (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-xs">Loading submissions...</p>
                      </div>
                    ) : Object.keys(groupedSubmissions).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(groupedSubmissions).slice(0, 1).map(([mentorName, reviews]) => (
                          <div key={mentorName} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-white">{mentorName}</h3>
                              <span className="text-xs text-gray-400">{reviews.length} submission{reviews.length !== 1 ? 's' : ''}</span>
                            </div>
                            {reviews.slice(0, 2).map((review) => (
                              <div key={review._id} className="p-3 bg-[#202327] rounded-lg border border-gray-600">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="text-white font-medium text-xs">Submitted {formatLastInteraction(review.createdAt)}</p>
                                  </div>
                                  <div className="flex gap-0.5">
                                    {review.rating && [...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                {review.review && (
                                  <div className="mb-2">
                                    {review.review.startsWith('http') ? (
                                      <div className="text-xs text-blue-400">📹 Video uploaded</div>
                                    ) : (
                                      <p className="text-gray-300 text-xs line-clamp-2">{review.review}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            {Object.keys(groupedSubmissions).length > 1 && (
                              <button 
                                onClick={() => navigate('/student/submissions')}
                                className="w-full mt-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium transition-colors"
                              >
                                View All Submissions
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">No submissions yet</p>
                        <p className="text-[11px] text-gray-500 mt-1">Rate or review your mentors</p>
                      </div>
                    )
                  )}
                </div>

                <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center">
                      <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Your Recent Mentors
                    </h2>
                    <button onClick={() => navigate('/student/mentors')} className="text-[#535353] hover:text-white text-xs font-medium">View All</button>
                  </div>

                  {mentorsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <FiLoader className="animate-spin text-white mr-2" />
                      <span className="text-gray-400 text-sm">Loading mentors...</span>
                    </div>
                  ) : mentors.length > 0 ? (
                    <div className="space-y-3">
                      {mentors.slice(0, 2).map((mentor) => (
                        <MentorCard key={mentor._id} mentor={mentor} onNavigate={navigate} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm">No recent mentors found</p>
                      <button onClick={() => navigate('/student/explore')} className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium">Browse Mentors</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>

          {/* RIGHT COLUMN - Profile, Karma & Sessions */}
          <aside className="col-span-3 space-y-3 overflow-y-auto custom-scroll">
            {/* Karma Points Card */}
            {/* <KarmaPoints userId={profile?._id} /> */}

            {/* Profile Card */}
            {profile && (
              <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700">
                <h2 className="text-sm font-semibold text-white mb-2">Your Profile</h2>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                      {profile.profilePicture ? (
                        <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{profile.name}</p>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-300">{profile.karmaPoints || 0} Karma</span>
                        <span className="text-[10px] text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{profile.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-700 text-gray-300 capitalize">{profile.role}</span>
                    <span className="text-xs text-gray-400">{profileCompletion}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${profileCompletion}%`, backgroundColor: '#ffffff' }}
                    ></div>
                  </div>
                  <button onClick={handleCompleteProfile} className="mt-3 w-full flex items-center justify-center px-3 py-2 border border-gray-600 rounded-lg text-xs font-semibold text-gray-300 bg-[#202327] hover:bg-[#2a2d32] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">
                    <FiUserPlus className="w-4 h-4 mr-2 text-white" />
                    Complete Your Profile
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Sessions */}
            <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white flex items-center">
                  <FiCalendar className="w-3.5 h-3.5 mr-1.5 text-white" />
                  Next Session
                </h2>
                <button onClick={() => navigate('/student/sessions')} className="text-[#535353] hover:text-white text-xs font-medium">View All</button>
              </div>

              {sessionsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-xs">Loading sessions...</p>
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session._id}>
                      <SessionTimer session={session} onJoinSession={handleJoinSession} userRole="student" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiCalendar className="w-8 h-8 text-white mx-auto mb-2" />
                  <h3 className="text-xs font-medium text-gray-300 mb-1">No upcoming sessions</h3>
                  <p className="text-[11px] text-gray-400 mb-2">Book a session with a mentor to get started!</p>
                  <button onClick={() => navigate('/student/explore')} className="inline-flex items-center px-2.5 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs">
                    <FiUser className="w-3 h-3 mr-1.5 text-white" />
                    Find Mentors
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Review Modals */}
      {selectedSession && (
        <>
          <RateModal
            isOpen={rateModalOpen}
            onClose={() => setRateModalOpen(false)}
            sessionId={selectedSession.sessionId || selectedSession._id}
            bookingId={selectedSession._id}
            mentorName={selectedSession.mentorId?.name || selectedSession.mentor?.name || 'Mentor'}
            sessionDate={selectedSession.sessionDate}
          />
          <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            sessionId={selectedSession.sessionId || selectedSession._id}
            bookingId={selectedSession._id}
            mentorName={selectedSession.mentorId?.name || selectedSession.mentor?.name || 'Mentor'}
            sessionDate={selectedSession.sessionDate}
          />
          <VideoUploadModal
            isOpen={videoModalOpen}
            onClose={() => setVideoModalOpen(false)}
            sessionId={selectedSession.sessionId || selectedSession._id}
            bookingId={selectedSession._id}
            mentorName={selectedSession.mentorId?.name || selectedSession.mentor?.name || 'Mentor'}
            sessionDate={selectedSession.sessionDate}
          />
        </>
      )}
    </div>
  );
};

export default UserDashboard;