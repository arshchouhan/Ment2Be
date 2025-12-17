import { useState } from "react";
import { X } from "lucide-react";
import * as forumService from "../../services/forumService";

export function AskQuestionModal({ open, onOpenChange, onQuestionCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await forumService.createQuestion({
        title: title.trim(),
        content: content.trim(),
        category
      });

      // Notify parent component of new question
      if (onQuestionCreated) {
        onQuestionCreated(result.question);
      }

      // Close modal and reset form
      onOpenChange(false);
      setTitle("");
      setContent("");
      setCategory("");
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err.message || 'Failed to create question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] text-white max-w-2xl w-full mx-4 rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold">Ask a Question</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Question Title</label>
            <input
              type="text"
              placeholder="Enter a brief title for your question"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder:text-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:border-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gray-500 cursor-pointer"
            >
              <option value="">Choose a category</option>
              <option value="engineering">Engineering</option>
              <option value="data-science">Data Science</option>
              <option value="business">Business</option>
              <option value="product">Product</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Question Details */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Question Details</label>
            <textarea
              placeholder="Describe your question in detail. Include any relevant context, background, or specific points you'd like addressed..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white placeholder:text-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:border-gray-500 resize-none"
            />
          </div>

          {/* Tips */}
          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
            <p className="text-sm font-medium text-gray-200 mb-2">Tips for asking good questions:</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Be specific about your situation and goals</li>
              <li>• Include relevant background information</li>
              <li>• Ask one question at a time for clearer answers</li>
              <li>• Check if similar questions have been asked before</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="bg-transparent border border-[#3a3a3a] text-white hover:bg-[#2a2a2a] px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title || !content || !category}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
