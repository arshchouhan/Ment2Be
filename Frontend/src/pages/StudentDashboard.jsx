import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiBookOpen, FiTrendingUp, FiUserPlus, FiLoader, FiX, FiCheck } from 'react-icons/fi';
import Navbar from '../components/StudentDashboard/Navbar';
import SessionTimer from '../components/SessionTimer';
import KarmaPointsCard from '../components/KarmaPointsCard/KarmaPointsCard';
import { formatDistanceToNow } from 'date-fns';
import { fetchStudentTasks } from '../services/studentTasksApi';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Profile completion form state
  const showProfileForm = searchParams.get('complete-profile') === 'true';
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    interests: '',
    goals: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    profilePicture: null
  });
  const [formLoading, setFormLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:4000/api/user/me", {
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
        // Pre-fill form with existing data
        if (data.user) {
          setFormData({
            bio: data.user.bio || '',
            skills: Array.isArray(data.user.skills) ? data.user.skills.join(', ') : '',
            interests: Array.isArray(data.user.interests) ? data.user.interests.join(', ') : (data.user.interests || ''),
            goals: data.user.goals || '',
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
    fetchUpcomingSessions();
    fetchRecentMessages();
    fetchRecentTasks();
  }, [navigate]);

  const fetchRecentMentors = async () => {
    try {
      setMentorsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch('http://localhost:4000/api/mentors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mentor data');
      }

      const data = await response.json();
      const allMentors = Array.isArray(data.mentors) ? data.mentors : [];

      const uniqueMentors = Array.from(new Map(
        allMentors.map(mentor => [mentor._id, mentor])
      ).values()).sort((a, b) =>
        new Date(b.lastInteraction || 0) - new Date(a.lastInteraction || 0)
      );

      setMentors(uniqueMentors);
    } catch (error) {
      console.error('Error fetching recent mentors:', error);
      setError('Failed to load recent mentors');
    } finally {
      setMentorsLoading(false);
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

  const fetchUpcomingSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSessionsLoading(true);
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success && data.bookings) {
        const upcoming = data.bookings.filter(booking => {
          const sessionDate = new Date(booking.sessionDate);
          const now = new Date();
          return sessionDate >= now && ['pending', 'confirmed'].includes(booking.status);
        }).sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

        setUpcomingSessions(upcoming.slice(0, 1));
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
        console.log('Messages API Response:', data); // Debug log
        
        const conversations = Array.isArray(data.data) ? data.data : (Array.isArray(data.conversations) ? data.conversations : []);
        
        // Get the latest message from each conversation and limit to 2
        const messages = conversations
          .filter(conv => conv.lastMessage)
          .map(conv => {
            // Handle different possible data structures
            const lastMsg = conv.lastMessage;
            return {
              _id: conv._id || Math.random(),
              senderId: lastMsg.senderId || lastMsg.sender?._id,
              senderName: conv.participantName || conv.participant?.name || lastMsg.sender?.name || 'Unknown',
              content: lastMsg.content || lastMsg.message || '',
              timestamp: lastMsg.timestamp || lastMsg.createdAt || new Date().toISOString(),
              participantId: conv.participantId || conv.participant?._id
            };
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 2);

        console.log('Processed messages:', messages); // Debug log
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

  const handleJoinSession = async (session) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to join the session');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/bookings/${session._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
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
      submitData.append('linkedIn', formData.linkedIn);
      submitData.append('github', formData.github);
      submitData.append('portfolio', formData.portfolio);

      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }

      const response = await fetch('http://localhost:4000/api/user/profile', {
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

  if (loading)
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    );

  return (
    <div className="h-screen bg-[#000000] text-white overflow-hidden flex flex-col">
      <style jsx>{`
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
              <div className="relative w-32 h-32">
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

              <div className="w-full space-y-1.5 mt-4">
                <button
                  onClick={() => navigate('/student/explore')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#212121] rounded-md transition-colors"
                >
                  <FiUser className="w-4 h-4" />
                  <span>Find Mentors</span>
                </button>

                <button
                  onClick={() => navigate('/student/sessions')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#212121] rounded-md transition-colors"
                >
                  <FiCalendar className="w-4 h-4" />
                  <span>My Sessions</span>
                </button>

                <button
                  onClick={() => navigate('/student/journal')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#212121] rounded-md transition-colors"
                >
                  <FiBookOpen className="w-4 h-4" />
                  <span>Learning Journal</span>
                </button>
              </div>

              <div className="w-full border-t border-gray-600 pt-3 text-center">
                <p className="text-gray-500 text-xs">Joined {joinedLabel}</p>
              </div>
            </div>
          </aside>

          {/* MIDDLE COLUMN - Main Content OR Profile Form */}
          <main className="col-span-7 space-y-3 overflow-y-scroll custom-scroll h-full max-h-[calc(100vh-6rem)]">
            {showProfileForm ? (
              <div className="bg-[#121212] rounded-lg shadow border border-gray-700 flex flex-col h-full max-h-[calc(100vh-7rem)]">
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700">
                  <div>
                    <h1 className="text-xl font-bold text-white">Complete Your Profile</h1>
                    <p className="text-sm text-gray-400 mt-1">Help mentors get to know you better</p>
                  </div>
                  <button onClick={handleCloseProfileForm} className="p-2 hover:bg-[#202327] rounded-lg transition-colors">
                    <FiX className="w-5 h-5 text-gray-400" />
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
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            case 'completed': return 'bg-green-900 text-green-300';
                            case 'in-progress': return 'bg-blue-900 text-blue-300';
                            case 'pending-review': return 'bg-yellow-900 text-yellow-300';
                            case 'not-started': return 'bg-gray-700 text-gray-300';
                            default: return 'bg-gray-700 text-gray-300';
                          }
                        };
                        
                        const getPriorityColor = (priority) => {
                          switch(priority) {
                            case 'high': return 'bg-red-900 text-red-300';
                            case 'medium': return 'bg-orange-900 text-orange-300';
                            case 'low': return 'bg-blue-900 text-blue-300';
                            default: return 'bg-gray-700 text-gray-300';
                          }
                        };

                        return (
                          <div key={task._id} className="flex items-start space-x-3 p-3 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors cursor-pointer" onClick={() => navigate('/student/tasks')}>
                            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-600 bg-[#121212] cursor-pointer" checked={task.status === 'completed'} disabled />
                            <div className="flex-1 min-w-0">
                              <p className={`text-white font-medium text-sm ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{task.description || 'No description'}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                              {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm">No tasks assigned yet</p>
                      <button onClick={() => navigate('/student/tasks')} className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium">View all tasks</button>
                    </div>
                  )}
                </div>

                <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  ) : recentMessages.length > 0 ? (
                    <div className="space-y-3">
                      {recentMessages.map((msg) => (
                        <div key={msg._id} className="flex items-start space-x-3 p-3 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors cursor-pointer" onClick={() => navigate('/student/chat')}>
                          <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {getInitials(msg.senderName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-medium text-sm truncate">{msg.senderName}</p>
                              <span className="text-gray-400 text-xs">{formatLastInteraction(msg.timestamp)}</span>
                            </div>
                            <p className="text-gray-300 text-xs mt-1 line-clamp-2">{msg.content}</p>
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
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Your Mentors
                    </h2>
                    <button onClick={() => navigate('/student/explore')} className="text-[#535353] hover:text-white text-xs font-medium">View All</button>
                  </div>

                  {mentorsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <FiLoader className="animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-400 text-sm">Loading mentors...</span>
                    </div>
                  ) : mentors.length > 0 ? (
                    <div className="space-y-3">
                      {mentors.slice(0, 2).map((mentor) => (
                        <div key={mentor._id} className="flex items-center space-x-3 p-3 bg-[#202327] rounded-lg hover:bg-[#2a2d32] transition-colors cursor-pointer" onClick={() => navigate(`/mentor/${mentor._id}`)}>
                          <div className="relative">
                            {mentor.hasConfirmedSession && (<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121212] z-10"></div>)}
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                              {mentor.profilePicture ? (<img src={mentor.profilePicture} alt={mentor.name} className="h-full w-full rounded-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.textContent = getInitials(mentor.name); }} />) : (<span>{getInitials(mentor.name)}</span>)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{mentor.name}</p>
                            <p className="text-gray-400 text-xs">{mentor.title || 'Mentor'}</p>
                          </div>
                          <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">{formatLastInteraction(mentor.lastInteraction)}</span>
                        </div>
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
                        <FiUser className="w-5 h-5 text-gray-300" />
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
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-700 text-gray-300 capitalize">{profile.role}</span>
                      <span className="text-xs text-gray-400">{Math.min(profile.karmaPoints || 0, 100)}/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                      <div 
                        className="bg-gray-500 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(profile.karmaPoints || 0, 100)}%` }}
                      ></div>
                    </div>
                    <button onClick={handleCompleteProfile} className="mt-3 w-full flex items-center justify-center px-3 py-2 border border-gray-600 rounded-lg text-xs font-semibold text-gray-300 bg-[#202327] hover:bg-[#2a2d32] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">
                      <FiUserPlus className="w-4 h-4 mr-2" />
                      Complete Your Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Sessions */}
            <div className="bg-[#121212] rounded-lg shadow p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white flex items-center">
                  <FiCalendar className="w-3.5 h-3.5 mr-1.5" />
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
                  <FiCalendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <h3 className="text-xs font-medium text-gray-300 mb-1">No upcoming sessions</h3>
                  <p className="text-[11px] text-gray-400 mb-2">Book a session with a mentor to get started!</p>
                  <button onClick={() => navigate('/student/explore')} className="inline-flex items-center px-2.5 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs">
                    <FiUser className="w-3 h-3 mr-1.5" />
                    Find Mentors
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;