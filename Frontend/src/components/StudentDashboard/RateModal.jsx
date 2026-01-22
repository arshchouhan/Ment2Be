import React, { useState } from 'react';

const RateModal = ({ isOpen, onClose, onSubmit, sessionId, bookingId, mentorName, sessionDate, sessionTime }) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const formatSessionDate = (date) => {
    if (!date) return 'Date not available';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatSessionTime = (date) => {
    if (!date) return 'Time not available';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionId || bookingId,
          bookingId: bookingId || sessionId,
          rating,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Rating submitted!');
        setRating(0);
        onClose();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#121212] rounded-lg p-6 w-96 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Rate {mentorName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Session Info */}
        <div className="bg-[#202327] rounded-lg p-4 mb-6 border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Session Details</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-white">{formatSessionDate(sessionDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-white">{formatSessionTime(sessionDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-600'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateModal;
