import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MentorNavbar from '../components/MentorDashboard/Navbar';
import SessionTimer from '../components/SessionTimer';
import { FiUpload, FiX, FiCalendar, FiUsers, FiClock, FiEdit3, FiSettings, FiLogOut, FiPlus, FiFolder, FiMoreVertical, FiBookOpen, FiTrendingUp, FiUserPlus, FiMessageSquare } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import KarmaPointsCard from '../components/KarmaPointsCard/KarmaPointsCard';

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
  });
  const [socialSaving, setSocialSaving] = useState(false);
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
  const fileInputRef = useRef(null);
  const bioRef = useRef(null);

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
    linkedinProfile: "",
    githubProfile: "",
  });

  const token = localStorage.getItem("token");

  // ✅ FETCH PROFILE FROM MONGODB
  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/user/me", {
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

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchProfile();
    fetchUpcomingSessions();
    fetchRecentMessages();
    fetchRecentMentees();
  }, [navigate]);

  const fetchUpcomingSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSessionsLoading(true);
      const response = await fetch('http://localhost:4000/api/bookings/mentor', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.bookings) {
        // Filter for upcoming sessions (confirmed or pending)
        const upcoming = data.bookings.filter(booking => {
          const sessionDate = new Date(booking.sessionDate);
          const now = new Date();
          return sessionDate >= now && ['pending', 'confirmed'].includes(booking.status);
        }).sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
        
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
      const response = await fetch('http://localhost:4000/api/messages/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Messages API Response:', data);
        
        const conversations = Array.isArray(data.data) ? data.data : (Array.isArray(data.conversations) ? data.conversations : []);
        
        // Get the latest message from each conversation and limit to 3
        const messages = conversations
          .filter(conv => conv.lastMessage)
          .map(conv => {
            // Handle different possible data structures
            const lastMsg = conv.lastMessage;
            return {
              _id: conv._id || Math.random(),
              senderId: lastMsg.senderId || lastMsg.sender?._id,
              senderName: conv.participantName || conv.participant?.name || lastMsg.sender?.name || 'Unknown',
              senderAvatar: conv.participant?.profilePicture || conv.participantAvatar || '',
              content: lastMsg.content || lastMsg.message || '',
              timestamp: lastMsg.timestamp || lastMsg.createdAt || new Date().toISOString(),
              participantId: conv.participantId || conv.participant?._id
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
      const response = await fetch('http://localhost:4000/api/bookings/mentor', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.bookings) {
        // Process mentees from bookings
        const menteesMap = new Map();
        
        data.bookings.forEach(booking => {
          if (!booking.student) return;
          
          const studentId = booking.student._id;
          if (!menteesMap.has(studentId)) {
            menteesMap.set(studentId, {
              ...booking.student,
              lastSession: booking.sessionDate,
              sessions: [],
              skills: booking.student.skills || ['General Mentoring']
            });
          }
          
          const mentee = menteesMap.get(studentId);
          mentee.sessions.push(booking);
          
          // Update last session date if this one is more recent
          if (new Date(booking.sessionDate) > new Date(mentee.lastSession)) {
            mentee.lastSession = booking.sessionDate;
          }
        });
        
        // Convert to array and sort by last session date
        const menteesArray = Array.from(menteesMap.values())
          .sort((a, b) => new Date(b.lastSession) - new Date(a.lastSession))
          .slice(0, 2); // Show only 2 most recent mentees
        
        setRecentMentees(menteesArray);
      }
    } catch (err) {
      console.error('Error fetching mentees:', err);
    } finally {
      setMenteesLoading(false);
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
      const response = await fetch(`http://localhost:4000/api/bookings/${session._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Open meeting room in new window/tab with room details
        const meetingUrl = `/meeting?roomId=${data.data.roomId}&sessionId=${data.data.sessionId}&userRole=${data.data.userRole}`;
        window.open(meetingUrl, '_blank', 'width=1200,height=800');
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
      
      const response = await fetch("http://localhost:4000/api/mentors/profile", {
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
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally show an error message to the user
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
      
      const response = await fetch(`http://localhost:4000/api/mentors/upload-photo`, {
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
      const response = await fetch(`http://localhost:4000/api/mentors/upload-photo`, {
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

  if (loading)
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    );

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

  const primarySkill = skills[0] || profile?.skills?.[0]?.name;
  const skillsList = skills.length > 0 ? skills : profile?.skills || [];
  const experienceLabel = mentorProfile?.experience
    ? `${mentorProfile.experience} year$${'{mentorProfile.experience > 1 ? "s" : ""}'}`
    : "Experience not added";

  return (
    <div className="h-screen bg-[#000000] text-gray-100 overflow-hidden">
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        /* Webkit Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #121212;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #535353;
          border-radius: 4px;
          border: 1px solid #202327;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        ::-webkit-scrollbar-corner {
          background: #121212;
        }
        
        /* Firefox Scrollbar Styling */
        * {
          scrollbar-width: thin;
          scrollbar-color: #535353 #121212;
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
          scrollbar-width: thin;
          scrollbar-color: #535353 #121212;
        }
        
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scroll::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 3px;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 3px;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #505050;
        }
      `}</style>
      <MentorNavbar userName={profile?.name || "Mentor"} />

      <div className="grid grid-cols-12 gap-2 p-4 h-full pt-20">
        {/* LEFT COLUMN - Profile Card */}
        <aside className="col-span-2 bg-[#121212] rounded-xl p-4 border border-gray-700 h-fit ml-4">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="relative h-40 w-35 rounded-lg bg-gray-700 overflow-hidden border-4 border-gray-600">
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
                onClick={() => setEditing(true)}
                className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-gray-300 hover:bg-[#212121] rounded-lg transition-colors text-sm"
              >
                <FiEdit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-gray-300 hover:bg-[#212121] rounded-lg transition-colors text-sm">
                <FiUsers className="w-4 h-4" />
                <span>Edit Membership</span>
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-gray-300 hover:bg-[#212121] rounded-lg transition-colors text-sm"
              >
                <FiLogOut className="w-4 h-4" />
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
        <main className="col-span-7 space-y-3 overflow-y-auto custom-scroll max-h-full">

          {/* Welcome Section */}
          {!editing && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-4 border border-gray-700">
              <h1 className="text-xl font-semibold text-white mb-1">Welcome back, {profile?.name}!</h1>
              <p className="text-gray-400 text-sm">Your mentoring journey at a glance</p>
            </div>
          )}

          {/* Recent Messages Card - Only show when not editing */}
          {!editing && (
            <div className="bg-[#121212] rounded-xl shadow-lg p-2 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white flex items-center">
                <FiMessageSquare className="w-4 h-4 mr-1.5" />
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
                <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-green-500"></div>
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

                  return (
                    <div 
                      key={msg._id} 
                      className="flex items-start space-x-2 p-2 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors cursor-pointer"
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
                          <span className="text-gray-400 text-xs">{formatLastInteraction(msg.timestamp)}</span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1 line-clamp-2">
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
      <h2 className="text-xs font-semibold text-white flex items-center">
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
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
                        className="flex items-center space-x-2 p-2 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors cursor-pointer"
                        onClick={() => navigate(`/mentor/mentees/${mentee._id}`)}
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
                          <p className="text-gray-400 text-xs">{mentee.headline || 'Mentee'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full">{mentee.experienceLevel || 'Beginner'}</span>
                          <span className="text-xs text-gray-500">{mentee.sessions?.length || 0} sessions</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
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
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <button className="pb-2 text-sm font-medium text-white border-b-2 border-gray-400">
                  Placement Videos
                </button>
                <button className="pb-2 text-sm font-medium text-gray-400 hover:text-white">
                  LTM Reviews
                </button>
                <button className="pb-2 text-sm font-medium text-gray-400 hover:text-white">
                  Session Reviews
                </button>
                <button className="pb-2 text-sm font-medium text-gray-400 hover:text-white">
                  Trial Reviews
                </button>
              </div>
              
              {/* Empty State */}
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {/* Main testimonial bubble */}
                    <div className="w-24 h-16 bg-gray-700 rounded-lg flex items-center justify-center relative">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0H4a1 1 0 00-1 1v3a1 1 0 001 1h3m0 0h8m-8 0v8a1 1 0 001 1h6a1 1 0 001-1V9m-8 0V8a1 1 0 011-1h6a1 1 0 011 1v1" />
                      </svg>
                    </div>
                    
                    {/* Smaller bubbles */}
                    <div className="absolute -top-2 -left-6 w-12 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                    </div>
                    
                    <div className="absolute -top-1 -right-8 w-16 h-12 bg-gray-600 rounded-lg"></div>
                    
                    <div className="absolute -bottom-3 -left-4 w-10 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    </div>
                    
                    <div className="absolute -bottom-2 -right-6 w-14 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 bg-gray-500 rounded-full"></div>
                    </div>
                    
                    {/* User avatars */}
                    <div className="absolute top-8 -left-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <div className="absolute top-6 -right-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-white mb-2">No video reviews have been received yet.</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  Level up your profile with mentee testimonials. Boost your reputation and showcase them publicly.
                </p>
                
                <button className="inline-flex items-center px-6 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Get Testimonial
                  <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Your professional headline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                    placeholder="Tell mentees about your background, experience, and what you can help them with..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
            </div>
          </div>
          )}
        </main>

        {/* RIGHT COLUMN - Next Session */}
        <aside className="col-span-3 space-y-3">
          {/* Your Profile Card */}
          <div className="bg-[#121212] rounded-xl shadow-lg p-4 border border-gray-700">
            <h2 className="text-sm font-semibold text-white mb-3">Your Profile</h2>
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
                <span className="text-xs text-gray-400">Profile Complete</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>
            <button 
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
              <FiUsers className="w-4 h-4 mr-2" />
              Complete Your Profile
            </button>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-[#121212] rounded-xl shadow-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center">
                <FiCalendar className="w-5 h-5 mr-2" />
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
                <FiClock className="w-6 h-6 mx-auto mb-2 animate-spin" />
                Loading sessions...
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
                <FiUsers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No upcoming sessions</h3>
                <p className="text-gray-500 mb-4">Your scheduled sessions will appear here</p>
                <button
                  onClick={() => navigate('/mentor/mentees')}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FiUsers className="w-4 h-4 mr-2" />
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
