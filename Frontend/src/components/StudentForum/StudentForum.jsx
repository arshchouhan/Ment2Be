import { useState, useEffect, useRef } from "react";
import { Search, Zap, Monitor, BarChart3, Briefcase, Lightbulb, MessageSquare, ArrowRight, Plus, ChevronDown } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import { AskQuestionModal } from "./AskQuestionModal";
import * as forumService from "../../services/forumService";

const domains = [
  { id: "for-you", label: "For You", icon: Zap },
  { id: "engineering", label: "Engineering", icon: Monitor },
  { id: "data-science", label: "Data Science", icon: BarChart3 },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "product", label: "Product", icon: Lightbulb },
];

export function StudentForum() {
  const [selectedDomain, setSelectedDomain] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("most-recent");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortDropdownRef = useRef(null);

  const sortOptions = [
    { value: "most-recent", label: "Most Recent" },
    { value: "most-upvoted", label: "Most Upvoted" },
    { value: "most-answered", label: "Most Answered" },
  ];

  const selectedSortLabel = sortOptions.find(o => o.value === sortBy)?.label || "Most Recent";

  // Get user from localStorage
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await forumService.getAllQuestions(1, 50);
        setQuestions(result.questions || []);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again later.');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isSortOpen) return;
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSortOpen]);

  // Dynamic date formatter
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    if (diffYears >= 1) return `${diffYears}y ago`;
    return date.toLocaleDateString();
  };

  // Calculate user-specific statistics
  const userStats = {
    myQuestions: questions.filter(q => q.author?._id === user?._id || q.author?.name === user?.name).length,
    answeredQuestions: questions.filter(q => 
      (q.author?._id === user?._id || q.author?.name === user?.name) && 
      q.answers && q.answers.length > 0
    ).length,
    pendingQuestions: questions.filter(q => 
      (q.author?._id === user?._id || q.author?.name === user?.name) && 
      (!q.answers || q.answers.length === 0)
    ).length
  };

  // Filter and sort questions
  const filteredQuestions = questions.filter((q) => {
    if (selectedDomain !== "for-you" && q.category !== selectedDomain) return false;
    if (searchQuery && !q.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !q.content?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "most-recent") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === "most-upvoted") {
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else if (sortBy === "most-answered") {
      return (b.answers?.length || 0) - (a.answers?.length || 0);
    }
    return 0;
  });

  return (
    <div className="h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8 h-full">
        <div className="flex gap-8 h-full">
          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Forum - Ask Mentors Anything</h1>
              <p className="text-gray-400 text-sm">
                Get your doubts cleared by experienced mentors. Ask questions about career, technology, interviews, and
                more. The community is here to help you succeed.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Questions Here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder:text-gray-500 h-12 rounded-lg focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Domain Filters */}
            <div className="mb-6">
              <p className="text-gray-300 text-sm mb-3 underline">Browse all Domains:</p>
              <div className="flex gap-3 flex-wrap">
                {domains.map((domain) => {
                  const Icon = domain.icon;
                  const isSelected = selectedDomain === domain.id;
                  return (
                    <button
                      key={domain.id}
                      onClick={() => setSelectedDomain(domain.id)}
                      className={`flex flex-col items-center justify-center px-6 py-4 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#212121] border-gray-500 text-white"
                          : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-2" />
                      <span className="text-xs">{domain.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Questions</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ask Question
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <div className="relative" ref={sortDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsSortOpen(prev => !prev)}
                      className="flex items-center justify-between gap-2 min-w-[170px] bg-[#1a1a1a] border border-[#2a2a2a] text-white px-3 py-2 rounded-lg text-sm hover:border-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600/40"
                      aria-haspopup="listbox"
                      aria-expanded={isSortOpen}
                    >
                      <span className="truncate">{selectedSortLabel}</span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                      <div className="absolute right-0 mt-2 w-[220px] bg-[#121212] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden z-20">
                        <div className="py-1" role="listbox" aria-label="Sort options">
                          {sortOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSortBy(opt.value);
                                setIsSortOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                opt.value === sortBy
                                  ? 'bg-[#212121] text-white'
                                  : 'text-gray-300 hover:bg-[#212121] hover:text-white'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4 pb-8">
              {loading ? (
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-16 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mb-4"></div>
                  <p className="text-gray-400">Loading questions...</p>
                </div>
              ) : error ? (
                <div className="bg-[#1a1a1a] rounded-lg border border-red-500/30 p-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-red-400">{error}</p>
                </div>
              ) : filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <QuestionCard key={question._id || question.id} question={question} />
                ))
              ) : (
                <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No questions found</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Info Card */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4 flex items-center gap-3 cursor-pointer hover:border-gray-500 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">How to Ask Better Questions</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>

            {/* Student Profile */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'ST'}
              </div>
              <div>
                <p className="font-medium text-sm">{user?.name || 'Student'}</p>
                <p className="text-xs text-gray-400">Student</p>
              </div>
            </div>

            {/* My Questions */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm mb-1">My Questions</p>
                  <p className="text-3xl font-bold">{userStats.myQuestions}</p>
                  <button className="text-gray-300 text-sm flex items-center gap-1 mt-2 hover:underline">
                    View My Questions <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="w-16 h-16 grid grid-cols-4 gap-0.5 opacity-20">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="bg-white/20 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Answered Questions */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm mb-1">Answered Questions</p>
                  <p className="text-3xl font-bold">{userStats.answeredQuestions}</p>
                  <button className="text-gray-300 text-sm flex items-center gap-1 mt-2 hover:underline">
                    View Answered <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="w-16 h-16 grid grid-cols-4 gap-0.5 opacity-20">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="bg-white/20 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Questions */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm mb-1">Pending Answers</p>
                  <p className="text-3xl font-bold">{userStats.pendingQuestions}</p>
                  <button className="text-gray-300 text-sm flex items-center gap-1 mt-2 hover:underline">
                    View Pending <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="w-16 h-16 grid grid-cols-4 gap-0.5 opacity-20">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="bg-white/20 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* Top Mentors */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
              <p className="font-medium text-sm mb-3">Top Mentors</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    RK
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rahul Kumar</p>
                    <p className="text-xs text-gray-400">142 answers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    SP
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sneha Patel</p>
                    <p className="text-xs text-gray-400">98 answers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    AM
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Arun Mehta</p>
                    <p className="text-xs text-gray-400">76 answers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onQuestionCreated={(newQuestion) => {
          setQuestions([newQuestion, ...questions]);
        }}
      />
    </div>
  );
}
