import { useState } from "react";
import { MessageSquare, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as forumService from "../../services/forumService";

export function QuestionCard({ question }) {
  const navigate = useNavigate();
  const [upvoted, setUpvoted] = useState(false);
  const [currentUpvotes, setCurrentUpvotes] = useState(question.upvotes || 0);
  const [isUpvoting, setIsUpvoting] = useState(false);

  // Get author initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format date dynamically
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

  const handleUpvote = async () => {
    try {
      setIsUpvoting(true);
      await forumService.upvoteQuestion(question._id || question.id);
      
      if (upvoted) {
        setCurrentUpvotes(currentUpvotes - 1);
      } else {
        setCurrentUpvotes(currentUpvotes + 1);
      }
      setUpvoted(!upvoted);
    } catch (err) {
      console.error('Error upvoting:', err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const authorName = question.author?.name || "Unknown User";
  const authorInitials = getInitials(authorName);

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-medium">
          {authorInitials}
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <span>Asked by </span>
          <span className="text-gray-200 ml-1">{authorName}</span>
          <span className="mx-2">|</span>
          <span>{formatDate(question.createdAt)}</span>
        </div>
      </div>

      {/* Question */}
      <p className="text-gray-200 font-medium mb-4 leading-relaxed">{question.title}</p>
      <p className="text-gray-300 text-sm mb-4 leading-relaxed">{question.content}</p>

      {/* Category Badge */}
      <div className="mb-4">
        <span className="inline-block bg-[#2a2a2a] text-gray-300 text-xs px-3 py-1 rounded-full">
          {question.category || "general"}
        </span>
      </div>

      {/* Answer Preview */}
      {question.answers && question.answers.length > 0 && (
        <div className="mb-4 bg-[#0a0a0a] rounded p-3 border border-[#2a2a2a]">
          <p className="text-gray-300 text-sm leading-relaxed">{question.answers[0].content}</p>
          {question.answers.length > 1 && (
            <button className="text-gray-300 text-sm mt-2 hover:underline">
              Read all {question.answers.length} answers
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-6">
          <button
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={`flex items-center gap-2 text-sm transition-colors ${
              upvoted ? "text-white" : "text-gray-400 hover:text-gray-300"
            } ${isUpvoting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ChevronUp className="h-4 w-4" />
            <span>{currentUpvotes} Upvotes</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MessageSquare className="h-4 w-4" />
            <span>{question.answers?.length || 0} Answers</span>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/student/forum/question/${question._id || question.id}`)}
          className="bg-transparent text-white hover:bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
