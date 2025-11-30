import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorNavbar from "../components/MentorDashboard/Navbar";

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
  const bioRef = React.useRef(null);

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
  }, [navigate]);

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

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading your dashboard...</p>
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
    <div className="min-h-screen bg-gray-100">
      <MentorNavbar userName={profile?.name || "Mentor"} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT PROFILE CARD */}
          <aside className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-semibold text-gray-600">
                {initials || ""}
              </div>
              <span className="absolute bottom-3 right-3 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
            </div>

            <div>
              <p className="text-2xl font-semibold text-gray-800">{profile?.name}</p>
              <p className="text-gray-500 text-sm">{profile?.email}</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition"
            >
              Edit Profile
            </button>

            <div className="w-full border-t pt-4 text-sm text-gray-500 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span role="img" aria-label="timezone">🕒</span>
                <span>Timezone not set</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span role="img" aria-label="calendar">📅</span>
                <span>Joined {joinedLabel}</span>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">About Me</h2>
                <div className="flex items-center gap-4 text-gray-400">
                  {mentorProfile?.githubProfile && (
                    <a
                      href={mentorProfile.githubProfile}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-gray-600"
                    >
                      GitHub
                    </a>
                  )}
                  {mentorProfile?.linkedinProfile && (
                    <a
                      href={mentorProfile.linkedinProfile}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-gray-600"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
              {mentorProfile?.headline && (
                <h3 className="mt-4 text-lg font-medium text-gray-800">
                  {mentorProfile.headline}
                </h3>
              )}
              <div className="relative">
                <p 
                  ref={bioRef}
                  className={`mt-2 text-gray-600 leading-relaxed ${!showFullBio ? 'line-clamp-3' : ''}`}
                >
                  {mentorProfile?.bio || "Add a short bio to let mentees know more about you."}
                </p>
                {mentorProfile?.bio && isBioTruncated && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-1 text-sm font-medium text-cyan-600 hover:text-cyan-700 focus:outline-none"
                  >
                    {showFullBio ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Expertise</h3>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 text-xl">
                  ⚙️
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{primarySkill || mentorProfile?.headline || "Skill not added"}</p>
                  <p className="text-gray-500 text-sm">
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
                      className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        className="text-xs text-cyan-700 hover:text-cyan-900"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-4">
                  Add your primary mentoring skills so mentees know where you shine.
                </p>
              )}
              <button
                onClick={() => {
                  setSkillModalOpen(true);
                  setSkillInput("");
                  setSkillError("");
                }}
                className="mt-4 text-sm font-medium text-cyan-700 hover:text-cyan-900"
              >
                + Add Skill
              </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Presence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="font-semibold text-gray-800">GitHub</p>
                  {mentorProfile?.githubProfile ? (
                    <a
                      href={mentorProfile.githubProfile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-cyan-600 break-words"
                    >
                      {mentorProfile.githubProfile}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">Add your GitHub profile</p>
                  )}
                  <button
                    onClick={() => setSocialEdit((prev) => ({ ...prev, githubProfile: !prev.githubProfile }))}
                    className="mt-2 text-xs font-medium text-cyan-700 block"
                  >
                    {socialEdit.githubProfile ? "Close" : "Edit GitHub URL"}
                  </button>
                  {socialEdit.githubProfile && (
                    <div className="mt-3 space-y-2">
                      <input
                        value={socialInputs.githubProfile}
                        onChange={(e) => handleSocialInputChange("githubProfile", e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <div className="flex gap-2 text-sm">
                        <button
                          type="button"
                          onClick={() => handleSocialSave("githubProfile")}
                          className="px-3 py-1 bg-cyan-600 text-white rounded"
                          disabled={socialSaving}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 border rounded text-gray-600"
                          onClick={() => setSocialEdit((prev) => ({ ...prev, githubProfile: false }))}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-semibold text-gray-800">LinkedIn</p>
                  {mentorProfile?.linkedinProfile ? (
                    <a
                      href={mentorProfile.linkedinProfile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-cyan-600 break-words"
                    >
                      {mentorProfile.linkedinProfile}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">Add your LinkedIn profile</p>
                  )}
                  <button
                    onClick={() => setSocialEdit((prev) => ({ ...prev, linkedinProfile: !prev.linkedinProfile }))}
                    className="mt-2 text-xs font-medium text-cyan-700"
                  >
                    {socialEdit.linkedinProfile ? "Close" : "Edit LinkedIn URL"}
                  </button>
                  {socialEdit.linkedinProfile && (
                    <div className="mt-3 space-y-2">
                      <input
                        value={socialInputs.linkedinProfile}
                        onChange={(e) => handleSocialInputChange("linkedinProfile", e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <div className="flex gap-2 text-sm">
                        <button
                          type="button"
                          onClick={() => handleSocialSave("linkedinProfile")}
                          className="px-3 py-1 bg-cyan-600 text-white rounded"
                          disabled={socialSaving}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 border rounded text-gray-600"
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
          </section>
        </div>
      </div>

      {/* Editing Overlay */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <form
            onSubmit={handleUpdate}
            className="bg-white w-full max-w-xl p-6 rounded-2xl shadow space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button type="button" onClick={() => setEditing(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <input
              name="company"
              placeholder="Company"
              value={formData.company}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            <input
              name="experience"
              placeholder="Experience in years"
              value={formData.experience}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            <input
              name="headline"
              placeholder="Headline"
              value={formData.headline}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            <textarea
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[120px]"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="linkedinProfile"
                placeholder="LinkedIn URL"
                value={formData.linkedinProfile}
                onChange={handleChange}
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                name="githubProfile"
                placeholder="GitHub URL"
                value={formData.githubProfile}
                onChange={handleChange}
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {skillModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <form
            onSubmit={handleAddSkill}
            className="bg-white w-full max-w-md p-6 rounded-2xl shadow space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add a skill</h3>
              <button type="button" onClick={() => setSkillModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g., System Design"
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {skillError && <p className="text-sm text-red-500">{skillError}</p>}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Or pick from popular skills:</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_SKILLS.map((label) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => handleQuickAddSkill(label)}
                    className="px-3 py-1 text-sm rounded-full border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg"
              >
                Save Skill
              </button>
              <button
                type="button"
                onClick={() => setSkillModalOpen(false)}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MentorDashboard;
