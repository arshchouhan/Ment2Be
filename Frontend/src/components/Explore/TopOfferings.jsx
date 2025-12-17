import React, { useState } from 'react';
import { FiX, FiGift } from 'react-icons/fi';

const offerings = [
  { id: 1, name: 'Mock Interviews', description: 'Practice interviews with experienced mentors to build confidence and improve your interview skills.' },
  { id: 2, name: 'Resume Review', description: 'Get professional feedback on your resume to make it stand out to recruiters and hiring managers.' },
  { id: 3, name: 'Career Guidance', description: 'Receive personalized career advice and guidance to navigate your professional growth.' },
  { id: 4, name: 'Salary Negotiation', description: 'Learn strategies to negotiate your salary and benefits effectively.' },
  { id: 5, name: 'Coding Tutoring', description: 'Master programming concepts with one-on-one coding tutorials from expert mentors.' },
  { id: 6, name: 'Personal Branding', description: 'Build your personal brand and establish yourself as an expert in your field.' }
];

const TopOfferings = () => {
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOfferingClick = (offering) => {
    setSelectedOffering(offering);
    setShowModal(true);
  };

  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 p-4 w-[270px]">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h3 className="text-sm font-semibold text-white">Top Offerings</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {offerings.map((offering) => (
          <button
            key={offering.id}
            onClick={() => handleOfferingClick(offering)}
            className="text-white text-xs font-medium py-2 px-3 rounded-md hover:opacity-80 transition-opacity text-center whitespace-nowrap border border-gray-600 w-[120px] cursor-pointer"
            style={{ backgroundColor: '#202327' }}
          >
            {offering.name}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedOffering && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121212] rounded-lg border border-gray-700 max-w-md w-full mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiGift size={20} style={{ color: '#ffffff' }} />
                <h2 className="text-lg font-semibold text-white">{selectedOffering.name}</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="h-5 w-5" style={{ color: '#ffffff' }} />
              </button>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-700">
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedOffering.description}
              </p>
            </div>

            {/* How to Get Started */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-white font-semibold mb-2">How to Get Started:</h3>
                <ol className="text-sm text-gray-300 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-white font-bold">1.</span>
                    <span>Browse mentors offering this service</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-white font-bold">2.</span>
                    <span>Check their reviews and experience</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-white font-bold">3.</span>
                    <span>Book a session at your preferred time</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-white font-bold">4.</span>
                    <span>Connect and achieve your goals</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                Close
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#202327] text-white hover:bg-gray-700 transition-colors font-medium text-sm border border-white"
              >
                Find Mentors
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopOfferings;