import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/backendConfig';
import { getBackendUrl } from '../utils/apiUrl.js';
import MentorNavbar from '../components/MentorDashboard/Navbar';
import SessionTimer from '../components/SessionTimer';
import { FiUpload, FiX, FiCalendar, FiUsers, FiClock, FiEdit3, FiSettings, FiLogOut, FiPlus, FiFolder, FiMoreVertical, FiBookOpen, FiTrendingUp, FiUserPlus, FiMessageSquare, FiAward, FiStar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import KarmaPointsCard from '../components/KarmaPointsCard/KarmaPointsCard';
import PageLoader from '../components/PageLoader';

const MentorDashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillError, setSkillError] = useState("");
  const [socialInputs, setSocialInputs] = useState({
    githubProfile: "",
    linkedinProfile: "",
  });
  const [socialEdit, setSocialEdit] = useState({
    githubProfile: false,
    linkedinProfile: false,
    phoneNumber: false,
  });
  const [socialSaving, setSocialSaving] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [showFullBio, setShowFullBio] = useState(false);
  const [isBioTruncated, setIsBioTruncated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [recentMentees, setRecentMentees] = useState([]);
  const [menteesLoading, setMenteesLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeReviewTab, setActiveReviewTab] = useState('videos'); // 'videos', 'ltm', 'session', 'trial'
  const [timeRefresh, setTimeRefresh] = useState(0); // Force re-render for dynamic time
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [saveToast, setSaveToast] = useState({ visible: false, type: 'success', message: '' });
  const fileInputRef = useRef(null);
  const bioRef = useRef(null);
  const saveToastTimeoutRef = useRef(null);

  const PRESET_SKILLS = [
    "System Design",
    "React",
    "Data Structures",
    "Algorithms",
    "DevOps",
    "Cloud Architecture",
    "AI/ML",
    "Product Strategy",
    "UI/UX",
    "Career Coaching",
    "Interview Prep",
  ];

  const [formData, setFormData] = useState({
    company: "",
    experience: "",
    headline: "",
    bio: "",
    phoneNumber: "",
    linkedinProfile: "",
    githubProfile: "",
  });

  const token = localStorage.getItem("token");

  // ✅ FETCH PROFILE FROM MONGODB
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setProfile(data.user);
      setMentorProfile(data.user.mentorProfile || null);

      // ✅ PREFILL FORM FOR EDITING
      const profileData = data.user.mentorProfile || {};
      setFormData({
        company: profileData.company || "",
        experience: profileData.experience || "",
        headline: profileData.headline || "",
        bio: profileData.bio || "",
        phoneNumber: data.user.phoneNumber || "",
        linkedinProfile: profileData.linkedinProfile || "",
        githubProfile: profileData.githubProfile || "",
      });
      setSkills(Array.isArray(profileData.skills) ? profileData.skills : []);
      setSocialInputs({
        githubProfile: profileData.githubProfile || "",
        linkedinProfile: profileData.linkedinProfile || "",
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionsCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setConnectionsLoading(true);
      const response = await fetch(`${API_BASE_URL}/connections/mentor-connections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ [MentorDashboard] Connections count:', data.count);
        setConnectionsCount(data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching connections count:', err);
    } finally {
      setConnectionsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchProfile();
    fetchUpcomingSessions();
    fetchRecentMessages();
    fetchRecentMentees();
    fetchConnectionsCount();
  }, [navigate]);

  // Fetch reviews after profile is loaded
  useEffect(() => {
    if (profile?._id) {
      fetchReviews();
    }
  }, [profile?._id]);

  // Update time display dynamically every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRefresh(prev => prev + 1);
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh messages every 10 seconds to show new messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      fetchRecentMessages();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(messageInterval);
  }, []);

  const fetchUpcomingSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSessionsLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/mentor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.bookings) {
        // Filter for upcoming sessions (confirmed status only, with future date)
        const now = new Date();
        const upcoming = data.bookings.filter(booking => {
          const sessionDate = new Date(booking.sessionDate);
          // Only show confirmed sessions with future dates
          return booking.status === 'confirmed' && sessionDate > now;
        }).sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
        
        console.log('Upcoming sessions filtered:', upcoming);
        setUpcomingSessions(upcoming.slice(0, 1)); // Show only next 1 session
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchRecentMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setMessagesLoading(true);
      console.log('🔄 Fetching recent messages...');
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 API Response Status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages API Response:', data);
        
        const conversations = Array.isArray(data.data) ? data.data : (Array.isArray(data.conversations) ? data.conversations : []);
        
        console.log('📨 Raw conversations data:', conversations);
        
        // Get the latest message from each conversation and limit to 3
        const messages = conversations
          .filter(conv => conv.lastMessage) // lastMessage is a string from the API
          .map(conv => {
            return {
              _id: conv.conversationId || Math.random(),
              senderId: conv.lastSender,
              senderName: conv.participantName || 'Unknown',
              senderAvatar: conv.profilePicture || '',
              content: conv.lastMessage, // This is already the message content string
              timestamp: conv.lastMessageTime || new Date().toISOString(),
              participantId: conv.participantId
            };
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 3);

        console.log('Processed messages:', messages);
        setRecentMessages(messages);
      } else {
        console.error('API Error:', response.status);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchRecentMentees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setMenteesLoading(true);
      // Fetch connections instead of bookings to get recent connections
      const response = await fetch(`${API_BASE_URL}/connections/mentor-connections?status=connected`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.data) {
        // Process mentees from connections, sorted by connection date
        const menteesArray = data.data
          .filter(connection => connection.student) // Filter out null/undefined students
          .map(connection => ({
            ...connection.student,
            lastConnection: connection.connectedAt,
            sessions: [],
            skills: connection.student?.skills || ['General Mentoring'] // Optional chaining for safety
          }))
          .sort((a, b) => new Date(b.lastConnection) - new Date(a.lastConnection))
          .slice(0, 2); // Show only 2 most recent connections
        
        setRecentMentees(menteesArray);
      }
    } catch (err) {
      console.error('Error fetching mentees:', err);
    } finally {
      setMenteesLoading(false);
    }
  };

  const fetchReviews = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile?._id) {
      console.log('fetchReviews: Missing token or profile ID');
      setReviewsLoading(false);
      return;
    }

    try {
      setReviewsLoading(true);
      console.log('Fetching reviews ABOUT mentor:', profile._id);
      
      // Use mentor query param to fetch reviews ABOUT this mentor (not BY this mentor)
      const response = await fetch(`${API_BASE_URL}/reviews?mentor=${profile._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Reviews API response status:', response.status);
      const data = await response.json();
      console.log('Reviews API response data:', data);
      
      if (response.ok) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        console.log('Reviews set successfully:', data.reviews?.length || 0, 'reviews');
      } else {
        console.error('Reviews API error:', data.message);
        setReviews([]);
        setAverageRating(0);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
      setAverageRating(0);
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

      // Call the join session API to get room details
      const response = await fetch(`${API_BASE_URL}/bookings/${session._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to meeting room with room details
        const meetingUrl = `/mentor/meeting/${encodeURIComponent(data.data.roomId)}/${data.data.sessionId}`;
        navigate(meetingUrl);
      } else {
        alert(data.message || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
    }
  };

  // ✅ FORM CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildProfilePayload = (overrides = {}) => {
    const pick = (field, fallback = "") => {
      if (overrides[field] !== undefined) return overrides[field];
      if (field === "skills") return skills;
      if (formData[field] !== undefined) return formData[field];
      if (mentorProfile && mentorProfile[field] !== undefined) return mentorProfile[field];
      return fallback;
    };

    return {
      company: pick("company"),
      experience:
        parseFloat(
          overrides.experience ?? formData.experience ?? mentorProfile?.experience ?? 0
        ) || 0,
      headline: pick("headline"),
      bio: pick("bio"),
      phoneNumber: overrides.phoneNumber ?? formData.phoneNumber ?? profile?.phoneNumber ?? "",
      linkedinProfile: pick("linkedinProfile"),
      githubProfile: pick("githubProfile"),
      skills: overrides.skills ?? skills,
      isProfileComplete: true,
    };
  };

  const saveProfile = async (overrides = {}) => {
    try {
      const payload = buildProfilePayload(overrides);
      console.log('Saving profile with payload:', payload);

      const apiUrl = getApiUrl().replace(/\/$/, '');
      
      const response = await fetch(`${apiUrl}/mentors/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Server responded with error:', {
          status: response.status,
          statusText: response.statusText,
          response: responseData
        });
        throw new Error(responseData.message || 'Failed to save profile');
      }
      
      // Update the local state with the updated profile data
      if (responseData.data) {
        setMentorProfile(prev => ({
          ...prev,
          ...responseData.data,
          skills: responseData.data.skills || prev?.skills || []
        }));
      }
      
      // Only fetch profile if needed (for full refresh)
      if (Object.keys(overrides).length === 0) {
        await fetchProfile();
      }
      
      return responseData;
    } catch (error) {
      console.error("Profile save failed:", {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const value = skillInput.trim();

    if (!value) {
      setSkillError("Please enter a skill name.");
      return;
    }

    if (skills.includes(value)) {
      setSkillError("Skill already added.");
      return;
    }

    const updatedSkills = [...skills, value];
    setSkills(updatedSkills);
    setSkillInput("");
    setSkillError("");
    setSkillModalOpen(false);
    persistSkills(updatedSkills);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter((skill) => skill !== skillToRemove);
    setSkills(updatedSkills);
    persistSkills(updatedSkills);
  };

  const handleQuickAddSkill = (label) => {
    if (skills.includes(label)) {
      setSkillError("Skill already added.");
      return;
    }

    const updatedSkills = [...skills, label];
    setSkills(updatedSkills);
    setSkillError("");
    setSkillModalOpen(false);
    persistSkills(updatedSkills);
  };

  const persistSkills = async (updatedSkills) => {
    try {
      await saveProfile({ skills: updatedSkills });
    } catch (error) {
      console.error("Failed to update skills:", error);
      // Revert skills on error
      setSkills(mentorProfile?.skills || []);
    }
  };

  const handleSocialInputChange = (field, value) => {
    setSocialInputs((prev) => ({ ...prev, [field]: value }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialSave = async (field) => {
    setSocialSaving(true);
    try {
      await saveProfile({ [field]: socialInputs[field] });
      setSocialEdit((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Revert the input field on error
      setSocialInputs(prev => ({
        ...prev,
        [field]: mentorProfile?.[field] || ''
      }));
    } finally {
      setSocialSaving(false);
    }
  };

  const handlePhoneSave = async () => {
    setSocialSaving(true);
    try {
      await saveProfile({ phoneNumber: phoneInput });
      setSocialEdit((prev) => ({ ...prev, phoneNumber: false }));
      // Refresh profile data to show updated phone number immediately
      await fetchProfile();
    } catch (error) {
      console.error('Failed to update phone number:', error);
      // Revert the input field on error
      setPhoneInput(profile?.phoneNumber || '');
    } finally {
      setSocialSaving(false);
    }
  };

  // Check if bio needs to be truncated
  useEffect(() => {
    if (bioRef.current) {
      const element = bioRef.current;
      setIsBioTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [mentorProfile?.bio]);

  // ✅ UPDATE PROFILE
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await saveProfile({ ...formData, skills });
      setEditing(false);
      if (saveToastTimeoutRef.current) clearTimeout(saveToastTimeoutRef.current);
      setSaveToast({ visible: true, type: 'success', message: 'Profile saved successfully' });
      saveToastTimeoutRef.current = setTimeout(() => {
        setSaveToast((prev) => ({ ...prev, visible: false }));
      }, 2500);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (saveToastTimeoutRef.current) clearTimeout(saveToastTimeoutRef.current);
      setSaveToast({ visible: true, type: 'error', message: 'Failed to save profile. Please try again.' });
      saveToastTimeoutRef.current = setTimeout(() => {
        setSaveToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if we have a valid mentor ID
    if (!mentorProfile?._id) {
      setUploadError('Please save your profile before uploading a photo');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      const response = await fetch(`${API_BASE_URL}/mentors/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload photo. Please try again.');
      }

      const result = await response.json();
      console.log('Upload response:', result);
      
      // Update the profile with the new photo URL
      if (result.photoUrl) {
        console.log('Setting profilePicture to:', result.photoUrl);
        setMentorProfile(prev => {
          const updated = {
            ...prev,
            profilePicture: result.photoUrl
          };
          console.log('Updated mentorProfile:', updated);
          return updated;
        });
      }
      
    } catch (error) {
      console.error('Photo upload failed:', error);
      setUploadError(error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!mentorProfile?._id) {
      setUploadError('Unable to remove photo: No mentor profile found');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mentors/upload-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove photo');
      }

      // Update the profile to remove the photo
      setMentorProfile(prev => ({
        ...prev,
        profilePicture: null
      }));
      
    } catch (error) {
      console.error('Failed to remove photo:', error);
      setUploadError('Failed to remove photo. Please try again.');
    }
  };

  if (loading) return <PageLoader label="Loading dashboard..." />;

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "";

  const joinedLabel = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  // Calculate mentor profile completion percentage
  const calculateMentorProfileCompletion = (profile, mentorProfile) => {
    if (!profile) return 0;
    
    const fieldChecks = [
      { name: 'name', value: profile.name },
      { name: 'email', value: profile.email },
      { name: 'company', value: mentorProfile?.company },
      { name: 'experience', value: mentorProfile?.experience },
      { name: 'headline', value: mentorProfile?.headline },
      { name: 'bio', value: mentorProfile?.bio },
      { name: 'phoneNumber', value: profile.phoneNumber },
      { name: 'profilePicture', value: mentorProfile?.profilePicture },
      { name: 'linkedinProfile', value: mentorProfile?.linkedinProfile },
      { name: 'githubProfile', value: mentorProfile?.githubProfile },
      { name: 'skills', value: mentorProfile?.skills && mentorProfile.skills.length > 0 }
    ];
    
    const completedFields = fieldChecks.filter(field => {
      const value = field.value;
      let isComplete = false;
      if (typeof value === 'string') isComplete = value.trim().length > 0;
      else if (typeof value === 'number') isComplete = value > 0;
      else if (Array.isArray(value)) isComplete = value.length > 0;
      else isComplete = Boolean(value);
      
      // Debug logging for missing fields
      if (!isComplete) {
        console.log(`❌ Missing field: ${field.name}`, value);
      } else {
        console.log(`✅ Complete field: ${field.name}`, value);
      }
      
      return isComplete;
    });
    
    const percentage = Math.round((completedFields.length / fieldChecks.length) * 100);
    console.log(`📊 Profile completion: ${completedFields.length}/${fieldChecks.length} = ${percentage}%`);
    
    return percentage;
  };

  const profileCompletion = calculateMentorProfileCompletion(profile, mentorProfile);

  const primarySkill = skills[0] || profile?.skills?.[0]?.name;
  const skillsList = skills.length > 0 ? skills : profile?.skills || [];
 
  return (
    <div className="h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
      {saveToast.visible && (
        <div className="fixed top-6 right-6 z-[9999]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-600/60 shadow-lg backdrop-blur-sm bg-[#202327]/95 text-gray-100">
            {saveToast.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 text-gray-200" />
            ) : (
              <FiAlertCircle className="w-5 h-5 text-gray-200" />
            )}
            <span className="text-sm font-medium">{saveToast.message}</span>
          </div>
        </div>
      )}

      <style>{`
        /* Hide scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: transparent;
        }

        ::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Firefox */
        * {
          scrollbar-width: none;
          scrollbar-color: transparent transparent;
        }

        /* Remove default arrows from number inputs */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }

        /* Custom scrollbar for specific containers */
        .custom-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .custom-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
      <MentorNavbar userName={profile?.name || "Mentor"} />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-3 p-4 h-full pt-20 max-w-full mx-auto w-full px-16 overflow-hidden">
        {/* LEFT COLUMN - Profile Card */}
        <aside className="col-span-1 md:col-span-1 lg:col-span-2 bg-[#121212] rounded-xl p-4 border border-gray-700 h-fit overflow-y-auto max-h-[calc(100vh-6rem)]">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="relative h-40 w-40 rounded-lg bg-gray-700 overflow-hidden border-4 border-gray-600">
                {mentorProfile?.profilePicture ? (
                  <>
                    <img 
                      src={mentorProfile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <FiX size={14} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-gray-300">
                    {initials || ""}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <label 
                    className="bg-white bg-opacity-80 p-2 rounded-full cursor-pointer hover:bg-opacity-100 transition-all"
                    title="Upload photo"
                  >
                    <FiUpload className="text-gray-700 w-4 h-4" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">{profile?.name}</h2>
              <p className="text-gray-400 text-sm"></p>
              <p className="text-gray-500 text-xs italic"></p>
            </div>

            {/* Menu Items */}
            <div className="w-full space-y-2 mt-4">
              <button
                onClick={() => navigate('/mentor/students')}
                className="w-full flex items-center space-x-2 px-3 py-1.5 text-gray-300 text-sm hover:bg-[#212121] rounded-lg transition-colors text-left"
              >
                <FiUsers className="w-4 h-4 text-white" />
                <span>Students: {connectionsLoading ? '...' : connectionsCount}</span>
              </button>
              
              <div className="flex items-center space-x-2 px-3 py-1.5 text-gray-300 text-sm">
                <FiAward className="w-4 h-4 text-white" />
                <span>Karma Points: {profile?.karmaPoints || 0}</span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1.5 text-gray-300 text-sm">
                <FiStar className="w-4 h-4 text-white" />
                <span>Ratings: {profile?.mentorProfile?.rating || 0}/5</span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1.5 text-gray-300 text-sm">
                <FiCalendar className="w-4 h-4 text-white" />
                <span>Sessions: {profile?.mentorProfile?.totalSessions || 0}</span>
              </div>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-gray-300 hover:bg-[#212121] rounded-lg transition-colors text-sm"
              >
                <FiLogOut className="w-4 h-4 text-white" />
                <span>Sign out</span>
              </button>
            </div>

            {/* Join Date */}
            <div className="w-full border-t border-gray-600 pt-2 text-center">
              <p className="text-gray-500 text-xs">Joined {joinedLabel}</p>
            </div>
          </div>
        </aside>

        {/* MIDDLE COLUMN - Main Content */}
        <main className="col-span-1 md:col-span-1 lg:col-span-7 space-y-3 overflow-y-auto custom-scroll max-h-full px-2">

          {/* Welcome Section */}
          {!editing && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-4 border border-gray-700">
              <h1 className="text-xl font-semibold mb-1 text-white">Welcome back, {profile?.name}!</h1>
              <p className="text-gray-400 text-sm">Your mentoring journey at a glance</p>
            </div>
          )}

          {/* Recent Messages Card - Only show when not editing */}
          {!editing && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-2 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center text-white">
                <FiMessageSquare className="w-4 h-4 mr-1.5 text-cyan-400" />
                Recent Messages
              </h2>
              <button
                onClick={() => navigate('/mentor/messages')}
                className="text-[#535353] hover:text-white text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-2 w-2" style={{borderBottomColor: '#ffffff'}}></div>
              </div>
            ) : recentMessages.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scroll">
                {recentMessages.map((msg) => {
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

                  // Use timeRefresh to trigger re-renders for dynamic time
                  const displayTime = formatLastInteraction(msg.timestamp);

                  return (
                    <div 
                      key={msg._id} 
                      className="flex items-start space-x-2 p-2 bg-[#2a3038] rounded-lg hover:bg-[#323a44] transition-colors cursor-pointer"
                      onClick={() => navigate('/mentor/messages')}
                    >
                      {msg.senderAvatar ? (
                        <img 
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{display: msg.senderAvatar ? 'none' : 'flex'}}>
                        {getInitials(msg.senderName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium text-sm truncate">{msg.senderName}</p>
                          <span className="text-gray-300 text-xs">{displayTime}</span>
                        </div>
                        <p className="text-gray-200 text-sm mt-1 line-clamp-2">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No recent messages</h3>
                <p className="text-gray-500">Messages from your mentees will appear here</p>
              </div>
            )}
          </div>
          )}

          {/* Recent Mentees Card - Only show when not editing */}
         {!editing && (
  <div className="bg-[#121212] rounded-lg shadow-lg p-2 border border-gray-700">
    <div className="flex items-center justify-between mb-1">
      <h2 className="text-xs font-semibold flex items-center text-white">
        <svg className="w-4 h-4 mr-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
        Recent Mentees
      </h2>
      <button
        onClick={() => navigate('/mentor/mentees')}
        className="text-[#535353] hover:text-white text-xs font-medium"
      >
        View All
      </button>
    </div>
              
              {menteesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6" style={{borderBottomColor: '#ffffff'}}></div>
                </div>
              ) : recentMentees.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
                  {recentMentees.map((mentee) => {
                    const lastSession = new Date(mentee.lastSession);
                    const now = new Date();
                    const daysAgo = Math.floor((now - lastSession) / (1000 * 60 * 60 * 24));
                    const timeAgo = daysAgo === 0 
                      ? 'Today' 
                      : daysAgo === 1 
                        ? 'Yesterday' 
                        : `${daysAgo} days ago`;

                    return (
                      <div 
                        key={mentee._id}
                        className="flex items-center space-x-2 p-2 bg-[#2a3038] rounded-lg hover:bg-[#323a44] transition-colors cursor-pointer"
                        onClick={() => navigate('/mentor/students')}
                      >
                        <div className="relative">
                          <img 
                            src={mentee.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentee.name)}&background=4a5568&color=fff`}
                            alt={mentee.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-500"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentee.name)}&background=4a5568&color=fff`;
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-gray-400 border-2 border-[#202327] rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm truncate">{mentee.name}</h3>
                          <p className="text-gray-300 text-xs">{mentee.headline || 'Mentee'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                            mentee.experienceLevel === 'Beginner' ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' :
                            mentee.experienceLevel === 'Intermediate' ? 'bg-green-900/30 text-green-400 border-green-700/50' :
                            mentee.experienceLevel === 'Advanced' ? 'bg-purple-900/30 text-purple-400 border-purple-700/50' :
                            mentee.experienceLevel === 'Expert' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50' :
                            'bg-gray-800/30 text-gray-400 border-gray-700/50'
                          }`}>
                            {mentee.experienceLevel || 'Beginner'}
                          </span>
                          <span className="text-xs text-gray-300">{mentee.sessions?.length || 0} sessions</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No recent mentees</h3>
                  <p className="text-gray-500">New mentees will appear here when they follow you</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews & Testimonials Card - Only show when not editing */}
          {!editing && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Reviews & Testimonials
                </h2>
                <button
                  onClick={() => navigate('/mentor/reviews')}
                  className="text-[#535353] hover:text-white text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-6 mb-6 border-b border-gray-600">
                <button 
                  onClick={() => setActiveReviewTab('videos')}
                  className={`pb-2 text-sm font-medium transition-colors ${activeReviewTab === 'videos' ? 'text-white border-b-2 border-gray-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Placement Videos
                </button>
                <button 
                  onClick={() => setActiveReviewTab('ltm')}
                  className={`pb-2 text-sm font-medium transition-colors ${activeReviewTab === 'ltm' ? 'text-white border-b-2 border-gray-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Ratings
                </button>
                <button 
                  onClick={() => setActiveReviewTab('session')}
                  className={`pb-2 text-sm font-medium transition-colors ${activeReviewTab === 'session' ? 'text-white border-b-2 border-gray-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Session Reviews
                </button>
                <button 
                  onClick={() => setActiveReviewTab('trial')}
                  className={`pb-2 text-sm font-medium transition-colors ${activeReviewTab === 'trial' ? 'text-white border-b-2 border-gray-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Trial Reviews
                </button>
              </div>
              
              {/* Reviews List - Filtered by Tab */}
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading reviews...</p>
                </div>
              ) : (
                <>
                  {/* Placement Videos Tab */}
                  {activeReviewTab === 'videos' && (
                    <>
                      {reviews.filter(r => r.review?.startsWith('http')).length > 0 ? (
                        <div className="space-y-4">
                          {reviews.filter(r => r.review?.startsWith('http')).slice(0, 3).map((review) => (
                            <div key={review._id} className="w-full max-w-xl mx-auto px-3 py-2 bg-[#202327] rounded-md border border-gray-600/60">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="flex items-center min-w-0">
                                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    {review.student?.profilePicture ? (
                                      <img src={review.student.profilePicture} alt={review.student?.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      <span className="text-white font-semibold text-sm">{review.student?.name?.charAt(0) || 'S'}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white font-medium text-sm truncate">{review.student?.name || 'Anonymous'}</p>
                                    <p className="text-gray-400 text-xs truncate">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                                  </div>
                                </div>
                                {review.rating && (
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <FiStar
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="bg-[#0f1115] rounded-md px-3 py-2 flex items-center justify-between">
                                <p className="text-gray-400 text-xs">Video Testimonial</p>
                                <a
                                  href={review.review}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-200 hover:text-white text-xs font-medium underline underline-offset-4"
                                >
                                  Watch
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="text-lg font-medium text-white mb-2">No video testimonials yet</h3>
                          <p className="text-gray-400 text-sm">Video testimonials will appear here</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Ratings Tab */}
                  {activeReviewTab === 'ltm' && (
                    <>
                      {reviews.filter(r => r.rating).length > 0 ? (
                        <div className="space-y-4">
                          {reviews.filter(r => r.rating).slice(0, 3).map((review) => (
                            <div key={review._id} className="w-full max-w-xl mx-auto px-3 py-2 bg-[#202327] rounded-md border border-gray-600/60">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center min-w-0">
                                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    {review.student?.profilePicture ? (
                                      <img src={review.student.profilePicture} alt={review.student?.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      <span className="text-white font-semibold text-sm">{review.student?.name?.charAt(0) || 'S'}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white font-medium text-sm truncate">{review.student?.name || 'Anonymous'}</p>
                                    <p className="text-gray-400 text-xs truncate">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-white leading-none">{review.rating}</span>
                                    <span className="text-gray-400 text-xs">/5</span>
                                  </div>
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <FiStar
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <h3 className="text-lg font-medium text-white mb-2">No ratings yet</h3>
                          <p className="text-gray-400 text-sm">Ratings will appear here</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Session Reviews Tab */}
                  {activeReviewTab === 'session' && (
                    <>
                      {(() => {
                        // Filter reviews to only show those with actual text comments (not just ratings or video URLs)
                        const reviewsWithComments = reviews.filter(review => {
                          if (!review.review || review.review.trim() === '') return false;
                          // Exclude reviews that are just video URLs
                          const isVideoUrl = review.review.includes('cloudinary.com') || review.review.includes('video/upload') || review.review.startsWith('http');
                          return !isVideoUrl;
                        });

                        return reviewsWithComments.length > 0 ? (
                          <div className="space-y-4">
                            {reviewsWithComments.slice(0, 3).map((review) => {
                              const truncatedText = review.review.length > 150 ? review.review.substring(0, 150) + '...' : review.review;
                              const shouldTruncate = review.review.length > 150;

                              return (
                                <div 
                                  key={review._id} 
                                  className="w-full max-w-xl mx-auto px-3 py-2 bg-[#202327] rounded-md border border-gray-600/60 cursor-pointer hover:border-gray-500/70 transition-colors"
                                  onClick={() => setSelectedReview(review)}
                                >
                                  <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center min-w-0">
                                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                        {review.student?.profilePicture ? (
                                          <img src={review.student.profilePicture} alt={review.student?.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                          <span className="text-white font-semibold text-sm">{review.student?.name?.charAt(0) || 'S'}</span>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-white font-medium text-sm truncate">{review.student?.name || 'Anonymous'}</p>
                                        <p className="text-gray-400 text-xs truncate">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-gray-300 text-sm leading-snug">{truncatedText}</p>
                                  {shouldTruncate && <p className="text-xs text-gray-400 mt-1">Read more...</p>}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-white mb-2">No session reviews yet</h3>
                            <p className="text-gray-400 text-sm">Session reviews will appear here</p>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {/* Trial Reviews Tab */}
                  {activeReviewTab === 'trial' && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-lg font-medium text-white mb-2">No trial reviews yet</h3>
                      <p className="text-gray-400 text-sm">Trial reviews will appear here</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

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

          {/* About Me Section - Only show when editing */}
          {editing && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">About Me</h2>
              {editing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUpdate}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {editing ? (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Headline</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#202327] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your professional headline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#202327] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Current company or organization"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#202327] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell mentees about your background, experience, and what you can help them with..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#202327] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Years of experience"
                    min="0"
                  />
                </div>
              </div>
            ) : (
              <div>
                {mentorProfile?.headline && (
                  <h3 className="mt-4 text-lg font-medium text-gray-200">
                    {mentorProfile.headline}
                  </h3>
                )}
                <div className="relative">
                  <p 
                    ref={bioRef}
                    className={`mt-2 text-gray-300 leading-relaxed ${!showFullBio ? 'line-clamp-3' : ''}`}
                  >
                    {mentorProfile?.bio || "Add a short bio to let mentees know more about you."}
                  </p>
                  {mentorProfile?.bio && isBioTruncated && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="mt-1 text-sm font-medium text-gray-400 hover:text-white focus:outline-none"
                    >
                      {showFullBio ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Expertise Section - Only show when editing */}
          {editing && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Expertise</h3>
              {editing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSkillModalOpen(true);
                      setSkillInput("");
                      setSkillError("");
                    }}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Add Skill
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl">
                ⚙️
              </div>
              <div>
                <p className="text-white font-medium">{primarySkill || mentorProfile?.headline || "Skill not added"}</p>
                <p className="text-gray-400 text-sm">
                  {mentorProfile?.experience
                    ? `${mentorProfile.experience} year${mentorProfile.experience > 1 ? "s" : ""} experience`
                    : "Experience not added"}
                </p>
              </div>
            </div>
            
            {skillsList.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-[#b3b3b3] text-[#535353] rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    {editing && (
                      <button
                        type="button"
                        className="text-xs text-black hover:text-red-600"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-4">
                Add your primary mentoring skills so mentees know where you shine.
              </p>
            )}
            
            {!editing && (
              <button
                onClick={() => {
                  setSkillModalOpen(true);
                  setSkillInput("");
                  setSkillError("");
                }}
                className="mt-4 text-sm font-medium text-[#535353] hover:text-white"
              >
                + Add Skill
              </button>
            )}
          </div>

          )}

          {/* Social Presence Section - Only show when editing */}
          {editing && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Social Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-600 rounded-lg p-4">
                <p className="font-semibold text-white">GitHub</p>
                {mentorProfile?.githubProfile ? (
                  <a
                    href={mentorProfile.githubProfile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-[#b3b3b3] break-words hover:text-white"
                  >
                    {mentorProfile.githubProfile}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">Add your GitHub profile</p>
                )}
                {(editing || socialEdit.githubProfile) && (
                  <button
                    onClick={() => setSocialEdit((prev) => ({ ...prev, githubProfile: !prev.githubProfile }))}
                    className="mt-2 text-xs font-medium text-[#535353] hover:text-white block"
                  >
                    {socialEdit.githubProfile ? "Close" : "Edit GitHub URL"}
                  </button>
                )}
                {socialEdit.githubProfile && (
                  <div className="mt-3 space-y-2">
                    <input
                      value={socialInputs.githubProfile}
                      onChange={(e) => handleSocialInputChange("githubProfile", e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-400"
                    />
                    <div className="flex gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => handleSocialSave("githubProfile")}
                        className="px-3 py-1 bg-gray-600 text-white rounded"
                        disabled={socialSaving}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                        onClick={() => setSocialEdit((prev) => ({ ...prev, githubProfile: false }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="border border-gray-600 rounded-lg p-4">
                <p className="font-semibold text-white">LinkedIn</p>
                {mentorProfile?.linkedinProfile ? (
                  <a
                    href={mentorProfile.linkedinProfile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-[#b3b3b3] break-words hover:text-white"
                  >
                    {mentorProfile.linkedinProfile}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">Add your LinkedIn profile</p>
                )}
                {(editing || socialEdit.linkedinProfile) && (
                  <button
                    onClick={() => setSocialEdit((prev) => ({ ...prev, linkedinProfile: !prev.linkedinProfile }))}
                    className="mt-2 text-xs font-medium text-[#535353] hover:text-white"
                  >
                    {socialEdit.linkedinProfile ? "Close" : "Edit LinkedIn URL"}
                  </button>
                )}
                {socialEdit.linkedinProfile && (
                  <div className="mt-3 space-y-2">
                    <input
                      value={socialInputs.linkedinProfile}
                      onChange={(e) => handleSocialInputChange("linkedinProfile", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-400"
                    />
                    <div className="flex gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => handleSocialSave("linkedinProfile")}
                        className="px-3 py-1 bg-gray-600 text-white rounded"
                        disabled={socialSaving}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                        onClick={() => setSocialEdit((prev) => ({ ...prev, linkedinProfile: false }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Phone Number Section */}
              <div className="border border-gray-600 rounded-lg p-4">
                <p className="font-semibold text-white">Phone Number</p>
                {profile?.phoneNumber ? (
                  <p className="text-sm text-[#b3b3b3] break-words">
                    {(() => {
                      // Clean the phone number display to remove concatenated duplicates
                      const rawPhone = profile.phoneNumber;
                      const phoneMatch = rawPhone.match(/^(\+\d+)\s*(.+)$/);
                      if (phoneMatch) {
                        const [, countryCode, numberPart] = phoneMatch;
                        const cleanNumberPart = numberPart.replace(/\D/g, '');
                        // If number is longer than 10 digits, it's likely duplicated - take first 10
                        const finalNumber = cleanNumberPart.length > 10 ? cleanNumberPart.substring(0, 10) : cleanNumberPart;
                        return countryCode + ' ' + finalNumber;
                      }
                      return rawPhone;
                    })()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Add your phone number</p>
                )}
                {(editing || socialEdit.phoneNumber) && (
                  <button
                    onClick={() => {
                      setSocialEdit((prev) => ({ ...prev, phoneNumber: !prev.phoneNumber }));
                      if (!socialEdit.phoneNumber) {
                        // Clean the phone number to remove any concatenated duplicates
                        const rawPhone = profile?.phoneNumber || '';
                        let cleanPhone = rawPhone;
                        
                        // Check if phone number has duplicated parts (like "+918544758216 8544758215")
                        const phoneMatch = rawPhone.match(/^(\+\d+)\s*(.+)$/);
                        if (phoneMatch) {
                          const [, countryCode, numberPart] = phoneMatch;
                          // Remove any duplicate digits that might be concatenated
                          const cleanNumberPart = numberPart.replace(/\D/g, ''); // Keep only digits
                          // If the number part is longer than expected (indicating duplication), take first 10 digits
                          const finalNumber = cleanNumberPart.length > 10 ? cleanNumberPart.substring(0, 10) : cleanNumberPart;
                          cleanPhone = countryCode + ' ' + finalNumber;
                        }
                        
                        setPhoneInput(cleanPhone);
                      }
                    }}
                    className="mt-2 text-xs font-medium text-[#535353] hover:text-white"
                  >
                    {socialEdit.phoneNumber ? "Close" : "Edit Phone Number"}
                  </button>
                )}
                {socialEdit.phoneNumber && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={phoneInput?.startsWith('+') ? phoneInput.split(' ')[0] : '+91'}
                        onChange={(e) => {
                          const code = e.target.value;
                          // Better regex to remove country code and any spaces/non-digits at start
                          const number = phoneInput?.replace(/^\+\d+\s*/, '').replace(/^\D+/, '') || '';
                          setPhoneInput(code + ' ' + number);
                        }}
                        className="w-28 px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm"
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
                        value={phoneInput?.replace(/^\+\d+\s*/, '').replace(/^\D+/, '') || ''}
                        onChange={(e) => {
                          const code = phoneInput?.startsWith('+') ? phoneInput.split(' ')[0] : '+91';
                          // Only keep digits from input
                          const cleanNumber = e.target.value.replace(/\D/g, '');
                          setPhoneInput(code + ' ' + cleanNumber);
                        }}
                        placeholder="(555) 123-4567"
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2 text-sm">
                      <button
                        type="button"
                        onClick={handlePhoneSave}
                        className="px-3 py-1 bg-gray-600 text-white rounded"
                        disabled={socialSaving}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                        onClick={() => setSocialEdit((prev) => ({ ...prev, phoneNumber: false }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </main>

        {/* RIGHT COLUMN - Next Session */}
        <aside className="col-span-1 md:col-span-1 lg:col-span-3 space-y-3 overflow-y-auto max-h-[calc(100vh-6rem)]">
          {/* Your Profile Card */}
          <div className="bg-[#121212] rounded-xl shadow-lg p-4 border border-gray-700">
            <h2 className="text-sm font-semibold mb-3 text-white flex items-center gap-2"><FiUsers className="w-4 h-4 text-white" />Your Profile</h2>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                {mentorProfile?.profilePicture ? (
                  <img src={mentorProfile.profilePicture} alt={profile?.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{profile?.name}</h3>
                <p className="text-gray-400 text-xs truncate">{profile?.email}</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Mentor</span>
                <span className="text-xs text-gray-400">{profileCompletion}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="h-2 rounded-full" style={{width: `${profileCompletion}%`, backgroundColor: '#ffffff'}}></div>
              </div>
              {profileCompletion < 100 && (
                <div className="mt-2 p-2 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-blue-400 text-xs font-medium mb-1">Complete your profile</p>
                      <p className="text-blue-300 text-xs leading-relaxed">Students can only find you on the explore page when your profile is 100% complete.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-center px-3 py-2 bg-[#2a3038] hover:bg-[#323a44] text-white rounded-lg transition-colors text-sm font-medium border border-gray-600/50">
              <FiUsers className="w-4 h-4 mr-2 text-white" />
              Complete Your Profile
            </button>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-[#121212] rounded-xl shadow-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center text-white">
                <FiCalendar className="w-5 h-5 mr-2 text-white" />
                Next Session
              </h2>
              <button
                onClick={() => navigate('/mentor/mentees')}
                className="text-[#535353] hover:text-white text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            {sessionsLoading ? (
              <div className="text-gray-800 text-center py-4">
                <FiClock className="w-6 h-6 mx-auto mb-2 animate-spin text-white" />
                <p className="text-gray-400 text-sm">Loading upcoming session...</p>
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <SessionTimer
                    key={session._id}
                    session={session}
                    onJoinSession={handleJoinSession}
                    onSessionExpired={() => fetchUpcomingSessions()}
                    userRole="mentor"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUsers className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No upcoming sessions</h3>
                <p className="text-gray-500 mb-4">Your scheduled sessions will appear here</p>
                <button
                  onClick={() => navigate('/mentor/mentees')}
                  className="inline-flex items-center px-4 py-2 bg-[#2a3038] hover:bg-[#323a44] text-white rounded-lg transition-colors border border-gray-600/50"
                >
                  <FiUsers className="w-4 h-4 mr-2 text-white" />
                  View Mentees
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>


      {skillModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <form
            onSubmit={handleAddSkill}
            className="bg-gray-800 border border-gray-700 w-full max-w-md p-6 rounded-2xl shadow space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Add a skill</h3>
              <button type="button" onClick={() => setSkillModalOpen(false)} className="text-gray-400 hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g., System Design"
              className="w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-400"
            />
            {skillError && <p className="text-sm text-red-400">{skillError}</p>}
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Or pick from popular skills:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_SKILLS.map((label) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => handleQuickAddSkill(label)}
                    className="px-3 py-1 text-sm rounded-full border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Save Skill
              </button>
              <button
                type="button"
                onClick={() => setSkillModalOpen(false)}
                className="flex-1 border border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
