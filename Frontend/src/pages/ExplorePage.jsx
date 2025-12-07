import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/StudentDashboard/Navbar';

// Components
import MentorCard from '../components/Explore/MentorCard';
import TopExperts from '../components/Explore/TopExperts';
import TopOfferings from '../components/Explore/TopOfferings';
import CategoryList from '../components/Explore/CategoryList';
import UserProfileCard from '../components/Explore/UserProfileCard';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Mentors');
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch mentors from API
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Build query params
        let url = 'http://localhost:4000/api/mentors';
        if (activeCategory !== 'All Mentors') {
          url += `?skill=${activeCategory}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          // Transform data to match your component's expected format
          const transformedMentors = data.mentors.map(mentor => ({
            id: mentor._id,
            name: mentor.name,
            title: mentor.headline || 'Mentor',
            companies: mentor.company || 'N/A',
            experience: mentor.experience || 'N/A',
            bio: mentor.bio || '',
            tags: Array.isArray(mentor.skills)
              ? mentor.skills
                  .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
                  .filter(Boolean)
              : [],
            rating: mentor.averageRating || 0,
            ratedCount: mentor.totalReviews || 0,
            price: mentor.hourlyRate || 0,
            priceUnit: 'Per Min',
            image: mentor.profilePicture || mentor.mentorProfile?.profilePicture || '',
            isOnline: mentor.isOnline || false
          }));
          
          setMentors(transformedMentors);
        } else {
          setError('Failed to load mentors');
        }
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load mentors');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [activeCategory]);

  // Filter mentors based on search query
  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#000000] text-gray-100 pt-14">
      <Navbar userName={user?.name || 'Student'} />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto pl-2 pr-2 sm:pl-3 sm:pr-3 lg:pl-4 lg:pr-4 py-8 h-full">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-12 gap-3 h-full">
            {/* Left Sidebar - Column 1 */}
            <div className="col-span-2 space-y-6 -ml-[60px]">
              <CategoryList 
                activeCategory={activeCategory} 
                onCategoryClick={setActiveCategory} 
              />
              <UserProfileCard user={user} />
            </div>

            {/* Main Content - Middle Column */}
            <div className="col-span-8 flex flex-col h-full overflow-hidden">
              {/* Search Bar */}
              <div className="relative mb-6 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search mentors, skills, or topics..."
                  className="w-full px-4 py-3 pl-10 rounded-3xl bg-[#202327] border border-[#202327] text-white focus:outline-white focus:ring-0 focus:border-[#202327]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Mentor Cards */}
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-gray-400">Loading mentors...</div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-red-500">{error}</div>
                  </div>
                ) : filteredMentors.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-gray-400">No mentors found</div>
                  </div>
                ) : (
                  filteredMentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar - Column 3 */}
            <div className="col-span-2 space-y-6">
              <TopExperts />
              <TopOfferings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;