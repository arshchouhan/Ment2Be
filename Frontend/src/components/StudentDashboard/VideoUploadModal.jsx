import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../../config/backendConfig';

const API_URL = API_BASE_URL?.replace('/api', '') || (import.meta.env.PROD ? 'https://k23dx.onrender.com' : 'http://localhost:4000');

const VideoUploadModal = ({ isOpen, onClose, sessionId, bookingId, mentorName }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      // Check file size (max 50MB for reliable Cloudinary uploads)
      if (file.size > 50 * 1024 * 1024) {
        alert('Video file size must be less than 50MB');
        return;
      }
      setVideoFile(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleSubmit = async () => {
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const token = localStorage.getItem('token');
      
      // Upload video to Cloudinary
      setUploadProgress(10);
      const uploadResponse = await fetch(`${API_URL}/api/upload/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(60);
      const uploadData = await uploadResponse.json();
      
      console.log('Upload Response Status:', uploadResponse.status);
      console.log('Upload Response Data:', uploadData);
      
      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.message || `Upload failed with status ${uploadResponse.status}`);
      }

      // Submit review with video URL
      setUploadProgress(80);
      const reviewResponse = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionId || bookingId,
          bookingId: bookingId || sessionId,
          rating: 5,
          review: uploadData.data.url,
        }),
      });

      const reviewData = await reviewResponse.json();
      setUploadProgress(100);
      
      if (reviewData.success) {
        alert('Video uploaded successfully!');
        setVideoFile(null);
        setUploadProgress(0);
        onClose();
      } else {
        throw new Error(reviewData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      alert('Error: ' + error.message);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#121212] rounded-lg p-6 w-96 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Video for {mentorName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-600 rounded p-6 text-center cursor-pointer hover:border-gray-500 mb-4"
        >
          {videoFile ? (
            <div>
              <p className="text-white font-medium">{videoFile.name}</p>
              <p className="text-xs text-gray-400 mt-1">Click to change</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-400">Click to upload video</p>
              <p className="text-xs text-gray-500 mt-1">Max 50MB</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Enhanced Progress Bar */}
        {loading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium text-white">
                  {uploadProgress < 60 ? 'Uploading video...' : 
                   uploadProgress < 80 ? 'Processing video...' : 
                   'Almost done...'}
                </span>
              </div>
              <span className="text-sm font-semibold text-green-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                }}
              ></div>
            </div>
            {videoFile && (
              <p className="text-xs text-gray-400 mt-2">
                {videoFile.name} • {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !videoFile}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
