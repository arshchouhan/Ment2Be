"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import './ForumPage.css'
import * as forumService from "../../services/forumService"
import {
  Search,
  Zap,
  Monitor,
  BarChart3,
  Briefcase,
  Lightbulb,
  ChevronDown,
  Play,
  ArrowUpRight,
  ArrowRight,
  PenLine,
  AlertCircle,
  MessageCircle,
} from "lucide-react"

const domains = [
  { id: "for-you", label: "For You", icon: Zap, color: "text-white" },
  { id: "engineering", label: "Engineering", icon: Monitor, color: "text-white" },
  { id: "data-science", label: "Data Science", icon: BarChart3, color: "text-white" },
  { id: "business", label: "Business", icon: Briefcase, color: "text-white" },
  { id: "product", label: "Product", icon: Lightbulb, color: "text-white" },
]

export function ForumPage() {
  const navigate = useNavigate()
  const [selectedDomain, setSelectedDomain] = useState("for-you")
  const [sortBy, setSortBy] = useState("Most Recent")
  const [searchQuery, setSearchQuery] = useState("")
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortDropdownRef = useRef(null)

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await forumService.getAllQuestions(1, 50);
      
      if (result.questions) {
        setQuestions(result.questions);
        filterAndSortQuestions(result.questions, selectedDomain, searchQuery, sortBy);
      } else {
        setQuestions([]);
        setFilteredQuestions([]);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to fetch questions');
      setQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  // Filter and sort questions
  const filterAndSortQuestions = (questionsData, domain, search, sort) => {
    let filtered = questionsData;

    // Filter by domain
    if (domain !== 'for-you') {
      filtered = filtered.filter(q => q.domain?.toLowerCase() === domain.toLowerCase());
    }

    // Filter by search query
    if (search.trim()) {
      filtered = filtered.filter(q =>
        q.title?.toLowerCase().includes(search.toLowerCase()) ||
        q.content?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sort === 'Most Recent') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sort === 'Most Answered') {
      filtered.sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0));
    } else if (sort === 'Most Upvoted') {
      filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    setFilteredQuestions(filtered);
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    filterAndSortQuestions(questions, selectedDomain, query, sortBy);
  };

  // Handle domain change
  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    filterAndSortQuestions(questions, domain, searchQuery, sortBy);
  };

  // Handle sort change
  const handleSortChange = (sort) => {
    setSortBy(sort);
    filterAndSortQuestions(questions, selectedDomain, searchQuery, sort);
  };

  const sortOptions = ["Most Recent", "Most Answered", "Most Upvoted"]

  return (
    <div className="h-screen bg-[#000000] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8 h-full flex flex-col">
        <div className="flex gap-8 h-full overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto pr-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitScrollbar: 'none' }}>
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {/* Header */}
            <h1 className="text-2xl font-bold text-white mb-2">Answer Questions to Discover Relevant Mentees</h1>
            <p className="text-[#b3b3b3] mb-6">
              Help mentees with their questions and build meaningful connections. Every answer you provide helps you discover students who need your expertise and increases your chances of getting more bookings.
            </p>

            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
              <input
                type="text"
                placeholder="Search Questions Here"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 h-12 border border-[#404040] rounded-lg text-white placeholder:text-[#535353] bg-[#121212] focus:outline-none focus:border-white"
              />
            </div>

            {/* Browse Domains */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-white mb-4 underline">Browse all Domains:</h2>
              <div className="flex gap-3 flex-wrap">
                {domains.map((domain) => {
                  const Icon = domain.icon
                  const isSelected = selectedDomain === domain.id
                  return (
                    <button
                      key={domain.id}
                      onClick={() => handleDomainChange(domain.id)}
                      className={`flex flex-col items-center justify-center px-6 py-4 rounded-lg border transition-all min-w-[100px] ${
                        isSelected
                          ? "border-white text-white bg-[#121212]"
                          : "border-[#404040] text-[#b3b3b3] hover:border-white bg-[#121212]"
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${domain.color}`} />
                      <span className="text-sm font-medium">{domain.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Questions Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Questions</h2>
                <div className="flex items-center gap-2 text-sm text-[#b3b3b3]">
                  <span>Sort by:</span>
                  <div ref={sortDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSortOpen((v) => !v)}
                      className="inline-flex items-center gap-2 font-medium text-white bg-[#121212] border border-[#404040] rounded-lg px-3 py-2 cursor-pointer hover:border-white transition-colors"
                    >
                      <span className="text-sm">{sortBy}</span>
                      <ChevronDown className={`h-4 w-4 text-white transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#121212] border border-[#404040] rounded-lg shadow-xl overflow-hidden z-50">
                        {sortOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              handleSortChange(option)
                              setIsSortOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              option === sortBy
                                ? 'bg-[#2a2d32] text-white'
                                : 'text-[#b3b3b3] hover:bg-[#2a2d32] hover:text-white'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#404040] mb-4" />

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading questions...</div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="p-4 border border-red-500 rounded-lg bg-[#121212]">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Error</span>
                  </div>
                  <p className="text-[#b3b3b3]">{error}</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredQuestions.length === 0 && (
                <div className="p-12 text-center border border-[#404040] rounded-lg bg-[#121212]">
                  <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No questions found</h3>
                  <p className="text-[#b3b3b3]">
                    {searchQuery ? 'Try adjusting your search query' : 'No questions in this category yet. Check back soon!'}
                  </p>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4 pb-8">
                {filteredQuestions.map((question) => {
                  const authorName = question.author?.name || "Unknown User";
                  const authorInitials = authorName
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  
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

                  return (
                    <div key={question._id || question.id} className="p-5 border border-[#404040] rounded-lg bg-[#121212]">
                      {/* Author Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full bg-[#2a2d32] border border-[#404040] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {question.author?.profilePicture ? (
                            <img 
                              src={question.author.profilePicture} 
                              alt={authorName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <span 
                            style={{ display: question.author?.profilePicture ? 'none' : 'flex' }}
                            className="text-white text-xs font-medium w-full h-full flex items-center justify-center"
                          >
                            {authorInitials}
                          </span>
                        </div>
                        <span className="text-sm text-[#b3b3b3]">
                          Asked by <span className="font-medium text-white">{authorName}</span>
                        </span>
                        <span className="text-[#535353]">|</span>
                        <span className="text-sm text-[#b3b3b3]">{formatDate(question.createdAt)}</span>
                      </div>

                      {/* Question Content */}
                      <p className="text-white font-medium leading-relaxed mb-4">{question.title}</p>
                      <p className="text-[#b3b3b3] text-sm leading-relaxed mb-4">{question.content}</p>

                      {/* Category Badge */}
                      <div className="mb-4">
                        <span className="inline-block bg-[#2a2a2a] text-gray-300 text-xs px-3 py-1 rounded-full">
                          {question.category || "general"}
                        </span>
                      </div>

                      {/* Answer Preview */}
                      {question.answers && question.answers.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[#b3b3b3] text-sm leading-relaxed">{question.answers[0].content}</p>
                          {question.answers.length > 1 && (
                            <button className="text-white text-sm font-medium mt-2 hover:underline">
                              Read all {question.answers.length} answers
                            </button>
                          )}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#404040]">
                        <div className="flex items-center gap-6">
                          <span className="text-sm text-[#b3b3b3]">{question.upvotes || 0} Upvotes</span>
                          <div className="flex items-center gap-1.5 text-sm text-[#b3b3b3]">
                            <PenLine className="h-4 w-4" />
                            <span>{question.answers?.length || 0} Answers</span>
                          </div>
                        </div>
                        <button 
                        onClick={() => navigate(`/mentor/forum/question/${question._id || question.id}`)}
                        className="bg-white text-black hover:bg-gray-200 rounded-lg px-4 py-2 font-medium transition-colors"
                      >
                        Answer Question
                      </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 shrink-0 space-y-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxHeight: 'calc(100vh - 120px)' }}>
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {/* Top Mentors Card */}
            <div className="p-4 border border-[#404040] rounded-lg bg-[#121212]">
              <h3 className="font-semibold text-white mb-3">Top Mentors</h3>
              {(() => {
                // Get all mentors from answers and count their answers
                const mentorMap = {};
                filteredQuestions.forEach(question => {
                  question.answers?.forEach(answer => {
                    const mentorId = answer.author?._id || answer.author?.name;
                    if (!mentorMap[mentorId]) {
                      mentorMap[mentorId] = {
                        name: answer.author?.name,
                        profilePicture: answer.author?.profilePicture,
                        answerCount: 0
                      };
                    }
                    mentorMap[mentorId].answerCount += 1;
                  });
                });
                
                const topMentors = Object.values(mentorMap)
                  .sort((a, b) => b.answerCount - a.answerCount)
                  .slice(0, 3);
                
                return topMentors.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No mentors yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topMentors.map((mentor, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded cursor-pointer transition-colors">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {mentor.profilePicture ? (
                            <img 
                              src={mentor.profilePicture} 
                              alt={mentor.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <span 
                            style={{ display: mentor.profilePicture ? 'none' : 'flex' }}
                            className="text-white font-medium text-sm w-full h-full flex items-center justify-center bg-blue-500"
                          >
                            {mentor.name ? mentor.name.split(' ').map(n => n[0]).join('') : '?'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{mentor.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{mentor.answerCount} answers</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* My Answers Card */}
            <div className="p-4 border border-[#404040] rounded-lg bg-[#121212] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-full opacity-60">
                <div
                  className="w-full h-full"
                  style={{
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)",
                    backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
                  `,
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="font-semibold text-white mb-2">My Answers</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  {questions.reduce((sum, q) => sum + (q.answers?.length || 0), 0)}
                </p>
                <div className="text-3xl">💬</div>
              </div>
            </div>

            {/* Reputation Card */}
            <div className="p-4 border border-[#404040] rounded-lg bg-[#121212] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-full opacity-60">
                <div
                  className="w-full h-full"
                  style={{
                    background: "linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 50%, #c084fc 100%)",
                    backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
                  `,
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="font-semibold text-white mb-2">Your Reputation</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  {(() => {
                    // Calculate reputation: +10 for each question asked, +25 for each answer given
                    const userQuestions = filteredQuestions.filter(q => q.author?.name === user?.name).length;
                    const userAnswers = filteredQuestions.reduce((sum, q) => {
                      return sum + (q.answers?.filter(a => a.author?.name === user?.name).length || 0);
                    }, 0);
                    return (userQuestions * 10) + (userAnswers * 25);
                  })()}
                </p>
                <div className="text-3xl">⭐</div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="p-4 border border-[#404040] rounded-lg bg-[#121212]">
              <h3 className="font-semibold text-white mb-3">Leaderboard</h3>
              {(() => {
                // Get all mentees who asked questions and count their questions
                const menteeMap = {};
                filteredQuestions.forEach(question => {
                  const menteeId = question.author?._id || question.author?.name;
                  if (!menteeMap[menteeId]) {
                    menteeMap[menteeId] = {
                      name: question.author?.name,
                      profilePicture: question.author?.profilePicture,
                      questionCount: 0
                    };
                  }
                  menteeMap[menteeId].questionCount += 1;
                });
                
                const topMentee = Object.values(menteeMap)
                  .sort((a, b) => b.questionCount - a.questionCount)
                  .slice(0, 1);
                
                return topMentee.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No leaders yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topMentee.map((mentee, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-[#1a1a1a] rounded">
                        <div className="text-white font-bold text-lg">🏆</div>
                        <div className="h-8 w-8 rounded-full bg-[#2a2d32] border border-[#404040] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {mentee.profilePicture ? (
                            <img 
                              src={mentee.profilePicture} 
                              alt={mentee.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <span 
                            style={{ display: mentee.profilePicture ? 'none' : 'flex' }}
                            className="text-white font-medium text-xs w-full h-full flex items-center justify-center"
                          >
                            {mentee.name ? mentee.name.split(' ').map(n => n[0]).join('') : '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{mentee.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{mentee.questionCount} questions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
